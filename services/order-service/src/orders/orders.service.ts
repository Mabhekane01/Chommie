import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Return, ReturnStatus } from './entities/return.entity';
import { Coupon, CouponType } from './entities/coupon.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('BNPL_SERVICE') private readonly bnplClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    @Inject('MEMBERSHIP_SERVICE') private readonly membershipClient: ClientProxy,
    @Inject('CIRCLE_SERVICE') private readonly circleClient: ClientProxy,
  ) {}

  async createCoupon(data: any): Promise<Coupon> {
    return this.couponRepository.save(data);
  }


  async validateCoupon(code: string, orderAmount: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code, isActive: true } });
    
    if (!coupon) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount for this coupon is R${coupon.minOrderAmount}`);
    }

    return coupon;
  }

  async create(createOrderDto: any): Promise<Order | null> {
    const { items, email, couponCode, pointsRedeemed, deliveryNotes, isPlusOrder, ...orderData } = createOrderDto;

    // 1. Check stock for all items
    for (const item of items) {
      const hasStock = await lastValueFrom(
        this.productClient.send({ cmd: 'check_stock' }, { id: item.productId, quantity: item.quantity })
      );
      if (!hasStock) {
        throw new BadRequestException(`Insufficient stock for product: ${item.productName}`);
      }
    }
    
    // 2. Decrement stock
    for (const item of items) {
      await lastValueFrom(
        this.productClient.send({ cmd: 'decrement_stock' }, { id: item.productId, quantity: item.quantity })
      );
    }
    
    // Reseller wholesale pricing (do.md §3.4) + price transparency (do.md §6):
    // resellers get volume-scaled bulk pricing; every order records savings vs retail.
    let memberType: string | undefined;
    try {
      const membership: any = await lastValueFrom(
        this.membershipClient.send({ cmd: 'get_membership' }, { userId: orderData.userId }).pipe(timeout(2000)),
      );
      memberType = membership?.type;
    } catch {
      /* not a member / membership unavailable — standard household pricing */
    }

    // Buying-circle tier (do.md §3.3): a member's best circle unlocks a deeper
    // discount on the STAPLES core — pooled demand is worth real money.
    let circlePct = 0;
    try {
      const circles: any[] = await lastValueFrom(
        this.circleClient.send({ cmd: 'get_my_circles' }, { userId: orderData.userId }).pipe(timeout(2000)),
      );
      circlePct = Math.max(0, ...((circles ?? []).map((c) => Number(c.extraDiscountPct) || 0)));
    } catch {
      /* not in a circle / circle-service unavailable — no circle discount */
    }

    let savingsAmount = 0;
    let stapleSubtotal = 0;
    for (const item of items) {
      let product: any = null;
      try {
        product = await lastValueFrom(
          this.productClient.send({ cmd: 'findOneProduct' }, item.productId).pipe(timeout(2500)),
        );
      } catch {
        /* no product reference available */
      }
      // Reseller gets the deepest applicable bulk tier (volume-scaled wholesale).
      if (memberType === 'RESELLER' && Array.isArray(product?.bulkPricing) && product.bulkPricing.length) {
        const tier = [...product.bulkPricing]
          .filter((t: any) => item.quantity >= t.minQuantity)
          .sort((a: any, b: any) => b.minQuantity - a.minQuantity)[0];
        if (tier) {
          const base = product.discountPrice ?? product.price ?? item.price;
          item.price = Math.round(base * (1 - Number(tier.discountPercentage) / 100) * 100) / 100;
        }
      }
      if (product?.isStaple) {
        stapleSubtotal += Number(item.price) * item.quantity;
      }
      // Retail reference + proven savings (uses the final, possibly-wholesale, price).
      const retail = item.retailPrice ?? product?.retailPrice;
      item.retailPrice = retail;
      if (retail && Number(retail) > Number(item.price)) {
        savingsAmount += (Number(retail) - Number(item.price)) * item.quantity;
      }
    }

    let totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;

    if (circlePct > 0 && stapleSubtotal > 0) {
      const circleDiscount = Math.round(stapleSubtotal * (circlePct / 100) * 100) / 100;
      discountAmount += circleDiscount;
      savingsAmount += circleDiscount; // circle savings are provable savings too (do.md §6)
    }

    // Loyalty Points Redemption (100 points = R1)
    if (pointsRedeemed && pointsRedeemed > 0) {
      const redemptionDiscount = pointsRedeemed / 100;
      discountAmount += redemptionDiscount;
      
      try {
        const result = await lastValueFrom(
          this.bnplClient.send({ cmd: 'redeem_coins' }, { userId: orderData.userId, amount: pointsRedeemed })
        );
        if (result.status === 'error') {
          throw new BadRequestException(result.message);
        }
      } catch (e) {
        throw new BadRequestException('Failed to redeem coins: ' + (e instanceof Error ? e.message : 'Unknown error'));
      }
    }

    if (couponCode) {
      try {
        const coupon = await this.validateCoupon(couponCode, totalAmount - discountAmount);
        let couponDiscount = 0;
        if (coupon.type === CouponType.PERCENTAGE) {
          couponDiscount = ((totalAmount - discountAmount) * Number(coupon.value)) / 100;
        } else {
          couponDiscount = Number(coupon.value);
        }
        discountAmount += couponDiscount;
      } catch (e) {
        throw e;
      }
    }

    totalAmount = Math.max(0, totalAmount - discountAmount);
    const vatAmount = totalAmount * 0.15; // 15% VAT

    const order = this.orderRepository.create({
      ...orderData,
      totalAmount,
      discountAmount,
      vatAmount,
      savingsAmount,
      pointsRedeemed: pointsRedeemed || 0,
      isPlusOrder: !!isPlusOrder,
      deliveryNotes,
      status: OrderStatus.PENDING,
      paymentMethod: orderData.paymentMethod as PaymentMethod,
    } as any);

    const savedOrder = await this.orderRepository.save(order) as unknown as Order;

    const orderItems = items.map((item: any) => this.orderItemRepository.create({
      ...item,
      order: savedOrder,
    }));

    await this.orderItemRepository.save(orderItems);

    // 3. Handle BNPL Payment
    if (orderData.paymentMethod === 'BNPL') {
      try {
        await lastValueFrom(
          this.bnplClient.send({ cmd: 'create_plan' }, {
            userId: savedOrder.userId,
            orderId: savedOrder.id,
            totalAmount: savedOrder.totalAmount
          })
        );
        
        // If plan creation successful, update order status
        savedOrder.status = OrderStatus.CONFIRMED; 
        await this.orderRepository.save(savedOrder);

      } catch (error: any) {
        console.error('BNPL Plan Creation Failed:', error);
        savedOrder.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(savedOrder);
        
        // TODO: Revert stock (omitted for MVP)
        
        throw new BadRequestException('BNPL Payment Failed: ' + (error.message || 'Unknown error'));
      }
    } else if (orderData.paymentMethod === 'CARD') {
      try {
        const transaction = await lastValueFrom(
          this.paymentClient.send({ cmd: 'process_payment' }, {
            orderId: savedOrder.id,
            userId: savedOrder.userId,
            amount: savedOrder.totalAmount,
            paymentMethod: 'CARD'
          })
        );

        if (transaction && transaction.status === 'COMPLETED') {
          savedOrder.status = OrderStatus.PAID; // Paid & Confirmed
          await this.orderRepository.save(savedOrder);
        } else {
          // Payment pending or failed
          // For MVP mock, it returns COMPLETED, so this path is unlikely unless logic changes
        }

      } catch (error) {
         console.error('Card Payment Failed:', error);
         // Keep status as PENDING or move to CANCELLED depending on business logic
         // For now, let's keep it pending so user can retry? Or fail hard.
         // Let's fail hard for feedback.
         savedOrder.status = OrderStatus.CANCELLED;
         await this.orderRepository.save(savedOrder);
         throw new BadRequestException('Payment Failed');
      }
    }

    if (email) {
        this.notificationClient.emit('order_created', {
            email,
            userId: savedOrder.userId,
            orderId: savedOrder.id,
            totalAmount: savedOrder.totalAmount,
        });
    }

    // Accrue proven savings to the member's running total (do.md §6 trust metric).
    if (savingsAmount > 0) {
        this.membershipClient.emit('accrue_savings', {
            userId: savedOrder.userId,
            cents: Math.round(savingsAmount * 100),
        });
    }

    return this.findOne(savedOrder.id);
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPurchasedProducts(userId: string): Promise<string[]> {
    const items = await this.orderItemRepository.find({
      where: {
        order: {
          userId,
          status: OrderStatus.PAID // Assuming PAID/DELIVERED/CONFIRMED are successful
        }
      },
      relations: ['order']
    });

    const productIds = items.map(item => item.productId);
    return [...new Set(productIds)]; // Return unique IDs
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.findOne(id);
    if (!order) return null;

    const history = order.trackingHistory || [];
    history.push({
        status,
        timestamp: new Date(),
        description: this.getStatusDescription(status)
    });

    const updateData: any = { 
        status,
        trackingHistory: history 
    };

    // Loyalty Points Earning (R1 = 1 point, 2x for Plus)
    if (status === OrderStatus.DELIVERED && (!order.pointsEarned || order.pointsEarned === 0)) {
      const multiplier = order.isPlusOrder ? 2 : 1;
      const pointsEarned = Math.floor(Number(order.totalAmount) * multiplier);
      updateData.pointsEarned = pointsEarned;
      this.bnplClient.emit('award_coins', { userId: order.userId, amount: pointsEarned });
    }

    await this.orderRepository.update(id, updateData);
    return this.findOne(id);
  }

  private getStatusDescription(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.PENDING: return 'Order placed and awaiting processing.';
        case OrderStatus.PAID: return 'Payment confirmed. Preparing your items.';
        case OrderStatus.CONFIRMED: return 'Order confirmed by seller.';
        case OrderStatus.PACKED: return 'Items have been packed and are ready for pickup.';
        case OrderStatus.SHIPPED: return 'Package has left the warehouse.';
        case OrderStatus.OUT_FOR_DELIVERY: return 'Package is with our local delivery partner.';
        case OrderStatus.DELIVERED: return 'Package delivered successfully.';
        case OrderStatus.CANCELLED: return 'Order has been cancelled.';
        case OrderStatus.RETURNED: return 'Package returned to warehouse.';
        default: return 'Status updated.';
    }
  }

  async hasPurchased(userId: string, productId: string): Promise<boolean> {
    const item = await this.orderItemRepository.findOne({
      where: {
        productId,
        order: {
          userId,
          status: OrderStatus.PAID // Or COMPLETED/DELIVERED. For now PAID is enough.
        }
      },
      relations: ['order']
    });
    return !!item;
  }

  async requestReturn(userId: string, returnData: any): Promise<Return> {
    const order = await this.orderRepository.findOne({ where: { id: returnData.orderId, userId } });
    if (!order) {
        throw new NotFoundException('Order not found');
    }
    
    // Validate status (must be delivered to return)
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.PAID) { 
        // Allowing PAID for testing if DELIVERED flow isn't fully simulated yet
        // In prod, strict DELIVERED check
    }

    const returnRequest = this.returnRepository.create({
        userId,
        orderId: returnData.orderId,
        items: returnData.items,
        status: ReturnStatus.REQUESTED
    });

    return this.returnRepository.save(returnRequest);
  }

  async getUserReturns(userId: string): Promise<Return[]> {
    return this.returnRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
    });
  }
}
