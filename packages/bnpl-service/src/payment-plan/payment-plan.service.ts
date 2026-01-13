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

    // 1. Check Eligibility
    const { eligible, reason } = await this.trustScoreService.checkEligibility(userId, totalAmount);
    // Note: checkEligibility currently only checks if totalAmount < limit. 
    // It does NOT check if (currentDebt + newAmount) < limit.
    // We need to fix that.
    
    // Quick fix: Get current active debt
    const currentDebt = await this.calculateCurrentDebt(userId);
    const profile = await this.trustScoreService.getProfile(userId);
    
    if (!profile) throw new BadRequestException('User profile not found');

    if (currentDebt + totalAmount > profile.creditLimit) {
        throw new BadRequestException(`Exceeds credit limit. Current debt: ${currentDebt}, Limit: ${profile.creditLimit}`);
    }

    // 2. Create Plan (Default: 4 installments, bi-weekly)
    // First payment is immediate (handled by Order Service -> Payment Service usually, but let's assume this plan tracks it)
    // Actually, usually BNPL collects 1st installment immediately.
    // Let's generate the schedule.
    
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

  async payInstallment(planId: string, installmentIndex: number): Promise<PaymentPlan> {
    const plan = await this.paymentPlanRepository.findOne({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plan not found');

    if (!plan.installments[installmentIndex]) {
        throw new BadRequestException('Installment not found');
    }

    const installment = plan.installments[installmentIndex];
    if (installment.status === 'PAID') {
        throw new BadRequestException('Installment already paid');
    }

    // Mark paid
    installment.status = 'PAID';
    // installment.paidAt = new Date(); // Need to update type if using this
    
    // Update plan balance
    plan.remainingBalance = Number(plan.remainingBalance) - Number(installment.amount);
    
    // Check if fully paid
    const allPaid = plan.installments.every(i => i.status === 'PAID');
    if (allPaid) {
        plan.status = PlanStatus.COMPLETED;
    }

    // Save changes
    const savedPlan = await this.paymentPlanRepository.save(plan);

    // Trigger score update
    await this.trustScoreService.handlePaymentSuccess(plan.userId);

    return savedPlan;
  }

  private generateInstallments(totalAmount: number) {
    const count = 4;
    const amountPerInstallment = totalAmount / count;
    const installments: {
        dueDate: Date;
        amount: number;
        status: 'PENDING' | 'PAID' | 'OVERDUE';
    }[] = [];

    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i * 14)); // Every 2 weeks
        
        installments.push({
            dueDate: date,
            amount: amountPerInstallment,
            status: 'PENDING'
        });
    }
    
    return installments;
  }
}
