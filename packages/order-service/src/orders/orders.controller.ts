import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'get_user_orders' })
  findAll(@Payload() data: { userId: string }) {
    return this.ordersService.findAllByUser(data.userId);
  }

  @MessagePattern({ cmd: 'get_order' })
  findOne(@Payload() data: { id: string }) {
    return this.ordersService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'update_order_status' })
  updateStatus(@Payload() data: { id: string; status: OrderStatus }) {
    return this.ordersService.updateStatus(data.id, data.status);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() data: { orderId: string; status: string }) {
    console.log(`Payment received for order ${data.orderId}. Updating status to ${data.status}`);
    await this.ordersService.updateStatus(data.orderId, OrderStatus.PAID);
  }
}
