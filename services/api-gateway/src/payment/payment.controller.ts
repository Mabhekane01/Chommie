import { Controller, Post, Get, Body, Param, Headers, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Payments API. Initiation requires a verified user (identity from the token);
 * provider webhooks are unauthenticated HTTP but verified cryptographically by
 * each provider adapter (signatures/HMAC) inside the payment-service.
 */
@Controller('payments')
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('process')
  processPayment(@CurrentUser() user: AuthUser, @Body() data: any) {
    return this.paymentClient.send({ cmd: 'process_payment' }, { ...data, userId: user.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':orderId')
  getTransaction(@Param('orderId') orderId: string) {
    return this.paymentClient.send({ cmd: 'get_transaction' }, { orderId });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('payfast/initiate')
  initiatePayFast(@CurrentUser() user: AuthUser, @Body() data: any) {
    return this.paymentClient.send({ cmd: 'initiate_payfast' }, { ...data, userId: user.id });
  }

  // PayFast ITN callback — verified via MD5 signature in the adapter.
  @Post('payfast/notify')
  handlePayFastNotify(@Body() data: any) {
    return this.paymentClient.send({ cmd: 'payfast_notify' }, data);
  }

  // Provider-agnostic rails (do.md §9): body { method, orderId, amount, email?, phone?, items? }
  @UseGuards(SupabaseAuthGuard)
  @Post('initiate')
  initiate(@CurrentUser() user: AuthUser, @Body() data: any) {
    return this.paymentClient.send(
      { cmd: 'initiate_payment' },
      { ...data, userId: user.id, email: user.email ?? data.email },
    );
  }

  // Provider webhook callback: POST /payments/webhook/ozow | payshap | payfast | yoco
  // Authenticated by provider signature verification inside each adapter.
  @Post('webhook/:provider')
  webhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    return this.paymentClient.send({ cmd: 'payment_webhook' }, { method: provider, payload, headers });
  }
}
