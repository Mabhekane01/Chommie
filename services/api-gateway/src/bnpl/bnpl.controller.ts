import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * BNPL / Trust Engine API. All routes require a verified user; the :userId path
 * segments are kept for compatibility but the token decides whose data you get.
 */
@UseGuards(SupabaseAuthGuard)
@Controller('bnpl')
export class BnplController {
  constructor(
    @Inject('BNPL_SERVICE') private readonly bnplClient: ClientProxy,
  ) {}

  @Post('trust-score/:userId')
  createProfile(@CurrentUser() user: AuthUser) {
    return this.bnplClient.send({ cmd: 'create_profile' }, { userId: user.id });
  }

  @Get('trust-score/:userId')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.bnplClient.send({ cmd: 'get_profile' }, { userId: user.id });
  }

  @Post('trust-score/:userId/calculate')
  calculateScore(@CurrentUser() user: AuthUser) {
    return this.bnplClient.send({ cmd: 'calculate_score' }, { userId: user.id });
  }

  @Post('eligibility')
  checkEligibility(@CurrentUser() user: AuthUser, @Body() data: { amount: number }) {
    return this.bnplClient.send({ cmd: 'check_eligibility' }, { userId: user.id, amount: data.amount });
  }

  @Get('plans/:userId')
  getUserPlans(@CurrentUser() user: AuthUser) {
    return this.bnplClient.send({ cmd: 'get_user_plans' }, { userId: user.id });
  }

  @Post('pay')
  payInstallment(@CurrentUser() user: AuthUser, @Body() data: { planId: string; installmentIndex: number }) {
    return this.bnplClient.send(
      { cmd: 'pay_installment' },
      { planId: data.planId, installmentIndex: data.installmentIndex, userId: user.id },
    );
  }

  @Post('use-coins')
  useCoins(@CurrentUser() user: AuthUser, @Body() data: { amount: number }) {
    return this.bnplClient.send({ cmd: 'use_coins' }, { userId: user.id, amount: data.amount });
  }
}
