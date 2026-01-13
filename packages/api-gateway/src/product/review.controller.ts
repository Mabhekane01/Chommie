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

  @Get('vendor/:vendorId')
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.productClient.send({ cmd: 'get_vendor_reviews' }, vendorId);
  }

  @Post('seller')
  createSellerReview(@Body() data: any) {
    return this.productClient.send({ cmd: 'create_seller_review' }, data);
  }

  @Get('seller/:vendorId')
  getSellerReviews(@Param('vendorId') vendorId: string) {
    return this.productClient.send({ cmd: 'get_seller_reviews' }, vendorId);
  }

  @Post(':id/helpful')
  voteHelpful(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'vote_helpful' }, id);
  }
}
