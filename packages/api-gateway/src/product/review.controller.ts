import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() data: { productId: string; userId: string; userName: string; rating: number; comment: string }) {
    return this.productClient.send({ cmd: 'create_review' }, data);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productClient.send({ cmd: 'get_product_reviews' }, productId);
  }
}
