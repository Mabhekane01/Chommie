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
  getUserOrders(@Payload() data: { userId: string }) {
    return this.ordersService.findAllByUser(data.userId);
  }

  @MessagePattern({ cmd: 'get_vendor_orders' })
  getVendorOrders(@Payload() data: { vendorId: string }) {
    return this.ordersService.findByVendor(data.vendorId);
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

  @MessagePattern({ cmd: 'check_purchase' })
  checkPurchase(@Payload() data: { userId: string; productId: string }) {
    return this.ordersService.hasPurchased(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'request_return' })
  async requestReturn(@Payload() data: { userId: string; returnData: any }) {
    return this.ordersService.requestReturn(data.userId, data.returnData);
  }

  @MessagePattern({ cmd: 'get_user_returns' })
  async getUserReturns(@Payload() userId: string) {
    return this.ordersService.getUserReturns(userId);
  }

  @MessagePattern({ cmd: 'validate_coupon' })
  async validateCoupon(@Payload() data: { code: string; orderAmount: number }) {
    try {
      return await this.ordersService.validateCoupon(data.code, data.orderAmount);
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @MessagePattern({ cmd: 'create_coupon' })
  createCoupon(@Payload() data: any) {
    return this.ordersService.createCoupon(data);
  }

  @MessagePattern({ cmd: 'get_vendor_coupons' })
  getVendorCoupons(@Payload() vendorId: string) {
    return this.ordersService.getVendorCoupons(vendorId);
  }
}
