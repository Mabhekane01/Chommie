import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPlan, PlanStatus } from './entities/payment-plan.entity';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { TrustScoreService } from '../trust-score/trust-score.service';

@Injectable()
export class PaymentPlanService {
  constructor(
    @InjectRepository(PaymentPlan)
    private paymentPlanRepository: Repository<PaymentPlan>,
    private trustScoreService: TrustScoreService,
  ) {}

  async create(createDto: CreatePaymentPlanDto): Promise<PaymentPlan> {
    const { userId, totalAmount } = createDto;

    // Eligibility is enforced against total exposure, not just this order:
    // (existing active debt + this amount) must sit within the credit limit.
    const profile = await this.trustScoreService.getProfile(userId);
    if (!profile) throw new BadRequestException('User profile not found');

    const currentDebt = await this.calculateCurrentDebt(userId);
    if (currentDebt + Number(totalAmount) > Number(profile.creditLimit)) {
        throw new BadRequestException(
            `Exceeds credit limit. Current debt: ${currentDebt}, Limit: ${profile.creditLimit}`,
        );
    }

    // 4 installments, bi-weekly, first due immediately.
    const installments = this.generateInstallments(totalAmount);

    const plan = this.paymentPlanRepository.create({
      ...createDto,
      remainingBalance: totalAmount,
      installments,
      status: PlanStatus.ACTIVE
    });

    return this.paymentPlanRepository.save(plan);
  }

  async calculateCurrentDebt(userId: string): Promise<number> {
    const activePlans = await this.paymentPlanRepository.find({
      where: { userId, status: PlanStatus.ACTIVE }
    });
    
    return activePlans.reduce((sum, plan) => sum + Number(plan.remainingBalance), 0);
  }

  async findByUser(userId: string): Promise<PaymentPlan[]> {
    return this.paymentPlanRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async payInstallment(planId: string, installmentIndex: number, userId?: string): Promise<PaymentPlan> {
    const plan = await this.paymentPlanRepository.findOne({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plan not found');

    // Ownership: when the caller's verified identity is provided (gateway always
    // sends it), you can only pay installments on your own plan.
    if (userId && plan.userId !== userId) {
      throw new BadRequestException('Not your payment plan');
    }

    if (!plan.installments[installmentIndex]) {
        throw new BadRequestException('Installment not found');
    }

    const installment = plan.installments[installmentIndex];
    if (installment.status === 'PAID') {
        throw new BadRequestException('Installment already paid');
    }

    // Mark paid
    installment.status = 'PAID';
    installment.paidAt = new Date();

    // Update plan balance — round to cents so repeated decimal subtraction can't
    // leave a sub-cent residue that shows as a non-zero balance on a paid plan.
    plan.remainingBalance =
        Math.round((Number(plan.remainingBalance) - Number(installment.amount)) * 100) / 100;

    // Check if fully paid
    const allPaid = plan.installments.every(i => i.status === 'PAID');
    if (allPaid) {
        plan.status = PlanStatus.COMPLETED;
        plan.remainingBalance = 0; // guard against any accumulated float drift
    }

    // Save changes
    const savedPlan = await this.paymentPlanRepository.save(plan);

    // Trigger score update
    await this.trustScoreService.handlePaymentSuccess(plan.userId);

    return savedPlan;
  }

  private generateInstallments(totalAmount: number) {
    const count = 4;
    // Split in whole cents so the four amounts sum back to the total exactly.
    // Any rounding remainder lands on the first (immediate) installment, which
    // is the BNPL convention — never leave fractional cents on a schedule.
    const totalCents = Math.round(Number(totalAmount) * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainderCents = totalCents - baseCents * count;

    const installments: {
        dueDate: Date;
        amount: number;
        status: 'PENDING' | 'PAID' | 'OVERDUE';
    }[] = [];

    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i * 14)); // Every 2 weeks

        const cents = i === 0 ? baseCents + remainderCents : baseCents;
        installments.push({
            dueDate: date,
            amount: cents / 100,
            status: 'PENDING'
        });
    }

    return installments;
  }
}
