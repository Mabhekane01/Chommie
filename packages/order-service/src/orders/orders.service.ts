import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order | null> {
    const { items, email, ...orderData } = createOrderDto;

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
    // In a real distributed transaction, this should be part of a Saga.
    // For now, we'll do it sequentially. If one fails, we should technically rollback others.
    for (const item of items) {
      await lastValueFrom(
        this.productClient.send({ cmd: 'decrement_stock' }, { id: item.productId, quantity: item.quantity })
      );
    }
    
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = this.orderRepository.create({
      ...orderData,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: orderData.paymentMethod as PaymentMethod,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = items.map(item => this.orderItemRepository.create({
      ...item,
      order: savedOrder,
    }));

    await this.orderItemRepository.save(orderItems);

    if (email) {
        this.notificationClient.emit('order_created', {
            email,
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

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }
}
