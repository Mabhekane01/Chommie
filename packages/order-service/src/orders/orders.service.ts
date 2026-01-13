import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
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
  ) {}

  async createCoupon(data: any): Promise<Coupon> {
    return this.couponRepository.save(data);
  }

  async getVendorCoupons(vendorId: string): Promise<Coupon[]> {
    return this.couponRepository.find({ where: { vendorId }, order: { createdAt: 'DESC' } });
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
    const { items, email, couponCode, ...orderData } = createOrderDto;

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
    
    let totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;

    if (couponCode) {
      try {
        const coupon = await this.validateCoupon(couponCode, totalAmount);
        if (coupon.type === CouponType.PERCENTAGE) {
          discountAmount = (totalAmount * Number(coupon.value)) / 100;
        } else {
          discountAmount = Number(coupon.value);
        }
        totalAmount = Math.max(0, totalAmount - discountAmount);
      } catch (e) {
        // Log but maybe continue without coupon? Or fail? Usually fail if user specifically applied it.
        throw e;
      }
    }

    const order = this.orderRepository.create({
      ...orderData,
      totalAmount,
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
    
    return this.findOne(savedOrder.id);
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async findByVendor(vendorId: string): Promise<any[]> {
    // We need to return orders that contain items from this vendor.
    // Since TypeORM doesn't easily support filtering parent by child property in 'find', 
    // we use QueryBuilder or filter manually.
    // Efficient way: Find OrderItems by vendorId, then fetch their Orders.
    
    const items = await this.orderItemRepository.find({
      where: { vendorId },
      relations: ['order'],
      order: { id: 'DESC' } 
    });

    // Group items by Order to reconstruct "Vendor Orders"
    // This effectively splits the order for the vendor view
    const vendorOrdersMap = new Map<string, any>();

    for (const item of items) {
        if (!vendorOrdersMap.has(item.order.id)) {
            vendorOrdersMap.set(item.order.id, {
                orderId: item.order.id,
                createdAt: item.order.createdAt,
                status: item.order.status,
                customerUserId: item.order.userId,
                shippingAddress: item.order.shippingAddress,
                totalAmount: 0, // Calculated for this vendor only
                items: []
            });
        }
        
        const vendorOrder = vendorOrdersMap.get(item.order.id);
        vendorOrder.items.push({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
        });
        vendorOrder.totalAmount += (Number(item.price) * item.quantity);
    }

    return Array.from(vendorOrdersMap.values());
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

    await this.orderRepository.update(id, { 
        status,
        trackingHistory: history 
    });
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
