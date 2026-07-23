import { Controller, Get, Post, Body, Param, Inject, UseGuards, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventsGateway } from '../events.gateway';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Orders API. Identity comes from the verified Supabase token — a client can
 * only create/read its own orders; status changes and coupons are admin-only.
 */
@Controller('orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: any) {
    return this.orderClient.send(
      { cmd: 'create_order' },
      { ...dto, userId: user.id, email: user.email ?? dto.email },
    );
  }

  // The :userId path segment is kept for API compatibility but ignored — the
  // token decides whose orders you see.
  @UseGuards(SupabaseAuthGuard)
  @Get('user/:userId')
  findAll(@CurrentUser() user: AuthUser) {
    return this.orderClient.send({ cmd: 'get_user_orders' }, { userId: user.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('user/:userId/purchased-products')
  getPurchasedProducts(@CurrentUser() user: AuthUser) {
    return this.orderClient.send({ cmd: 'get_purchased_products' }, { userId: user.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const order = await firstValueFrom(this.orderClient.send({ cmd: 'get_order' }, { id }));
    if (order && order.userId !== user.id) {
      throw new ForbiddenException('Not your order');
    }
    return order;
  }

  @UseGuards(AdminGuard)
  @Post(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orderClient.send({ cmd: 'update_order_status' }, { id, status: body.status }).pipe(
      tap((updatedOrder) => {
        if (updatedOrder && updatedOrder.userId) {
          this.eventsGateway.emitOrderUpdate(updatedOrder.userId, updatedOrder);
        }
      }),
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('return')
  requestReturn(@CurrentUser() user: AuthUser, @Body() body: { returnData: any }) {
    return this.orderClient.send({ cmd: 'request_return' }, { userId: user.id, returnData: body.returnData });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('returns/:userId')
  getUserReturns(@CurrentUser() user: AuthUser) {
    return this.orderClient.send({ cmd: 'get_user_returns' }, user.id);
  }

  @Post('validate-coupon')
  validateCoupon(@Body() body: { code: string; orderAmount: number }) {
    return this.orderClient.send({ cmd: 'validate_coupon' }, body);
  }

  @UseGuards(AdminGuard)
  @Post('coupons')
  createCoupon(@Body() body: any) {
    return this.orderClient.send({ cmd: 'create_coupon' }, body);
  }
}
