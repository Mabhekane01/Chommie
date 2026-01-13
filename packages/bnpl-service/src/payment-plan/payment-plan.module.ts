import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlanService } from './payment-plan.service';
import { PaymentPlanController } from './payment-plan.controller';
import { PaymentPlan } from './entities/payment-plan.entity';
import { TrustScoreModule } from '../trust-score/trust-score.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentPlan]),
    TrustScoreModule
  ],
  controllers: [PaymentPlanController],
  providers: [PaymentPlanService],
  exports: [PaymentPlanService] // Export if needed by other internal modules
})
export class PaymentPlanModule {}
