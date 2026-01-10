import { Controller, Post, Get, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('wishlist')
export class WishlistController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Get(':userId')
  getWishlist(@Param('userId') userId: string) {
    return this.productClient.send({ cmd: 'get_wishlist' }, userId);
  }

  @Post()
  addProduct(@Body() data: { userId: string; productId: string }) {
    return this.productClient.send({ cmd: 'add_to_wishlist' }, data);
  }

  @Delete(':userId/:productId')
  removeProduct(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.productClient.send({ cmd: 'remove_from_wishlist' }, { userId, productId });
  }
}
