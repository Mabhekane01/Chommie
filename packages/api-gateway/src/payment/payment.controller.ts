import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('payments')
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  @Post('process')
  processPayment(@Body() data: { orderId: string; userId: string; amount: number; paymentMethod: string }) {
    return this.paymentClient.send({ cmd: 'process_payment' }, data);
  }

  @Get(':orderId')
  getTransaction(@Param('orderId') orderId: string) {
    return this.paymentClient.send({ cmd: 'get_transaction' }, { orderId });
  }

  @Post('payfast/initiate')
  initiatePayFast(@Body() data: any) {
    return this.paymentClient.send({ cmd: 'initiate_payfast' }, data);
  }

  @Post('payfast/notify')
  handlePayFastNotify(@Body() data: any) {
    return this.paymentClient.send({ cmd: 'payfast_notify' }, data);
  }
}
