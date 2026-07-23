import { Controller, Post, Get, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/** Wishlist API — identity from the verified token only. */
@UseGuards(SupabaseAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Get(':userId')
  getWishlist(@CurrentUser() user: AuthUser) {
    return this.productClient.send({ cmd: 'get_wishlist' }, user.id);
  }

  @Post()
  addProduct(@CurrentUser() user: AuthUser, @Body() data: { productId: string }) {
    return this.productClient.send({ cmd: 'add_to_wishlist' }, { userId: user.id, productId: data.productId });
  }

  @Delete(':userId/:productId')
  removeProduct(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.productClient.send({ cmd: 'remove_from_wishlist' }, { userId: user.id, productId });
  }
}
