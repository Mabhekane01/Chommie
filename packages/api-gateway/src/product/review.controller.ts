import { Controller, Post, Get, Patch, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() data: { productId: string; userId: string; userName: string; rating: number; title: string; comment: string; images?: string[] }) {
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

  @Patch(':id/response')
  addResponse(@Param('id') id: string, @Body('response') response: string) {
    return this.productClient.send({ cmd: 'add_review_response' }, { reviewId: id, response });
  }
}
