import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('ai')
export class RecommendationController {
  constructor(
    @Inject('RECOMMENDATION_SERVICE') private readonly recommendationClient: ClientProxy,
  ) {}

  @Post('chat')
  chat(@Body() data: { userId?: string; query: string }) {
    return this.recommendationClient.send({ cmd: 'ai_chat' }, data);
  }
}