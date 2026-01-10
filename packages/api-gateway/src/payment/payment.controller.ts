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
}
