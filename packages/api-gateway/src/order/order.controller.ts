import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventsGateway } from '../events.gateway';
import { tap } from 'rxjs/operators';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.orderClient.send({ cmd: 'create_order' }, createOrderDto);
  }

  @Get('user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_user_orders' }, { userId });
  }

  @Get('user/:userId/purchased-products')
  getPurchasedProducts(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_purchased_products' }, { userId });
  }

  @Get('vendor/:vendorId')
  findVendorOrders(@Param('vendorId') vendorId: string) {
    return this.orderClient.send({ cmd: 'get_vendor_orders' }, { vendorId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_order' }, { id });
  }

  @Post(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orderClient.send({ cmd: 'update_order_status' }, { id, status: body.status })
      .pipe(
        tap(updatedOrder => {
          if (updatedOrder && updatedOrder.userId) {
            this.eventsGateway.emitOrderUpdate(updatedOrder.userId, updatedOrder);
          }
        })
      );
  }

  @Post('return')
  requestReturn(@Body() body: { userId: string; returnData: any }) {
    return this.orderClient.send({ cmd: 'request_return' }, body);
  }

  @Get('returns/:userId')
  getUserReturns(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_user_returns' }, userId);
  }

  @Post('validate-coupon')
  validateCoupon(@Body() body: { code: string; orderAmount: number }) {
    return this.orderClient.send({ cmd: 'validate_coupon' }, body);
  }

  @Post('coupons')
  createCoupon(@Body() body: any) {
    return this.orderClient.send({ cmd: 'create_coupon' }, body);
  }

  @Get('coupons/vendor/:vendorId')
  getVendorCoupons(@Param('vendorId') vendorId: string) {
    return this.orderClient.send({ cmd: 'get_vendor_coupons' }, vendorId);
  }
}
