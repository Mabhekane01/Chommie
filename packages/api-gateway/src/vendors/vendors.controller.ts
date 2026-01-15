import { Controller, Get, Patch, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('vendors')
export class VendorsController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get(':id/orders')
  getOrders(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_vendor_orders' }, { vendorId: id });
  }

  @Get(':id/products')
  getProducts(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'get_vendor_products' }, { vendorId: id });
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'get_vendor_reviews' }, id);
  }

  @Get(':id/coupons')
  getCoupons(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_vendor_coupons' }, id);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.authClient.send({ cmd: 'get_profile' }, { userId: id });
  }

  @Get(':id/settings')
  getSettings(@Param('id') id: string) {
    return this.authClient.send({ cmd: 'get_profile' }, { userId: id });
  }

  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.authClient.send({ cmd: 'update_profile' }, { userId: id, ...settings });
  }
}
