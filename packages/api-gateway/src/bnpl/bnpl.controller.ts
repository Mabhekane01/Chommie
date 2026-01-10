import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('bnpl')
export class BnplController {
  constructor(
    @Inject('BNPL_SERVICE') private readonly bnplClient: ClientProxy,
  ) {}

  @Post('trust-score/:userId')
  createProfile(@Param('userId') userId: string) {
    return this.bnplClient.send({ cmd: 'create_profile' }, { userId });
  }

  @Get('trust-score/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.bnplClient.send({ cmd: 'get_profile' }, { userId });
  }

  @Post('trust-score/:userId/calculate')
  calculateScore(@Param('userId') userId: string) {
    return this.bnplClient.send({ cmd: 'calculate_score' }, { userId });
  }

  @Post('eligibility')
  checkEligibility(@Body() data: { userId: string; amount: number }) {
    return this.bnplClient.send({ cmd: 'check_eligibility' }, data);
  }
}