import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  // Reviewer identity comes from the verified token — not spoofable.
  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() data: { productId: string; rating: number; title: string; comment: string; images?: string[] },
  ) {
    return this.productClient.send(
      { cmd: 'create_review' },
      { ...data, userId: user.id, userName: user.email?.split('@')[0] ?? 'Member' },
    );
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productClient.send({ cmd: 'get_product_reviews' }, productId);
  }

  // Seller/vendor reviews removed — Chommie is the retailer; only products are reviewed.

  // Requires a verified user so votes can't be stuffed anonymously.
  @UseGuards(SupabaseAuthGuard)
  @Post(':id/helpful')
  voteHelpful(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'vote_helpful' }, id);
  }

  // Official responses come from Chommie ops.
  @UseGuards(AdminGuard)
  @Patch(':id/response')
  addResponse(@Param('id') id: string, @Body('response') response: string) {
    return this.productClient.send({ cmd: 'add_review_response' }, { reviewId: id, response });
  }
}
