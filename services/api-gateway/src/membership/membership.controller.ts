import { Controller, Get, Post, Delete, Body, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * REST surface for membership + standing baskets (do.md §3.1, §3.2, §3.4).
 * Hard-authenticated: identity always comes from the verified Supabase token.
 */
@Controller('membership')
@UseGuards(SupabaseAuthGuard)
export class MembershipController {
  constructor(@Inject('MEMBERSHIP_SERVICE') private readonly client: ClientProxy) {}

  private uid(user: AuthUser | undefined): string {
    return user?.id ?? '';
  }

  @Post('join')
  join(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.client.send({ cmd: 'join_membership' }, { ...data, userId: this.uid(user) });
  }

  @Get()
  get(@CurrentUser() user: AuthUser | undefined, @Query('userId') userId?: string) {
    return this.client.send({ cmd: 'get_membership' }, { userId: this.uid(user) });
  }

  @Post('status')
  setStatus(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.client.send(
      { cmd: 'set_membership_status' },
      { userId: this.uid(user), status: data.status },
    );
  }

  @Get('basket')
  getBasket(@CurrentUser() user: AuthUser | undefined, @Query('userId') userId?: string) {
    return this.client.send({ cmd: 'get_standing_basket' }, { userId: this.uid(user) });
  }

  @Post('basket')
  setItem(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.client.send(
      { cmd: 'set_standing_basket_item' },
      { userId: this.uid(user), productId: data.productId, quantity: data.quantity },
    );
  }

  @Post('basket/status')
  setBasketStatus(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.client.send(
      { cmd: 'set_basket_status' },
      { userId: this.uid(user), status: data.status },
    );
  }

  @Delete('basket/:itemId')
  removeItem(@CurrentUser() user: AuthUser | undefined, @Param('itemId') itemId: string, @Query('userId') userId?: string) {
    return this.client.send(
      { cmd: 'remove_standing_basket_item' },
      { userId: this.uid(user), itemId },
    );
  }
}
