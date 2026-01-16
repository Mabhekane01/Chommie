import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'process_payment' })
  process(@Payload() data: any) {
    return this.paymentsService.processPayment(data);
  }

  @MessagePattern({ cmd: 'get_transaction' })
  findOne(@Payload() data: { orderId: string }) {
    return this.paymentsService.getTransactionByOrder(data.orderId);
  }

  @MessagePattern({ cmd: 'initiate_payfast' })
  initiatePayFast(@Payload() data: any) {
    return this.paymentsService.createPayFastPayment(data);
  }

  @MessagePattern({ cmd: 'payfast_notify' })
  handleNotify(@Payload() data: any) {
    return this.paymentsService.handlePayFastNotify(data);
  }
}
