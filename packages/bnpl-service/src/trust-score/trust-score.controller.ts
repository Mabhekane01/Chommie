import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { TrustScoreService } from './trust-score.service';

@Controller()
export class TrustScoreController {
  constructor(private readonly trustScoreService: TrustScoreService) {}

  @MessagePattern({ cmd: 'create_profile' })
  create(@Payload() data: { userId: string }) {
    return this.trustScoreService.createProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get_profile' })
  findOne(@Payload() data: { userId: string }) {
    return this.trustScoreService.getProfile(data.userId);
  }

  @MessagePattern({ cmd: 'calculate_score' })
  calculate(@Payload() data: { userId: string }) {
    return this.trustScoreService.calculateScore(data.userId);
  }

  @MessagePattern({ cmd: 'check_eligibility' })
  checkEligibility(@Payload() data: { userId: string; amount: number }) {
    return this.trustScoreService.checkEligibility(data.userId, data.amount);
  }

  @MessagePattern({ cmd: 'use_coins' })
  useCoins(@Payload() data: { userId: string; amount: number }) {
    return this.trustScoreService.useCoins(data.userId, data.amount);
  }

  @MessagePattern({ cmd: 'redeem_coins' })
  async redeemCoins(@Payload() data: { userId: string; amount: number }) {
    const success = await this.trustScoreService.useCoins(data.userId, data.amount);
    return success ? { success: true } : { status: 'error', message: 'Insufficient coins' };
  }

  @EventPattern('award_coins')
  async awardCoins(@Payload() data: { userId: string; amount: number }) {
    return this.trustScoreService.awardCoins(data.userId, data.amount);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() data: { userId: string }) {
    if (data.userId) {
      await this.trustScoreService.handlePaymentSuccess(data.userId);
    }
  }
}
