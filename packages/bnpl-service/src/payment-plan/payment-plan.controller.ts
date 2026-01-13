import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentPlanService } from './payment-plan.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';

@Controller()
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @MessagePattern({ cmd: 'create_plan' })
  create(@Payload() data: CreatePaymentPlanDto) {
    return this.paymentPlanService.create(data);
  }

  @MessagePattern({ cmd: 'get_user_plans' })
  getUserPlans(@Payload() data: { userId: string }) {
    return this.paymentPlanService.findByUser(data.userId);
  }

  @MessagePattern({ cmd: 'pay_installment' })
  payInstallment(@Payload() data: { planId: string; installmentIndex: number }) {
    return this.paymentPlanService.payInstallment(data.planId, data.installmentIndex);
  }
}
