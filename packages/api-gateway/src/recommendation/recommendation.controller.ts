import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('recommendations')
export class RecommendationController {
  constructor(
    @Inject('RECOMMENDATION_SERVICE') private readonly recommendationClient: ClientProxy,
  ) {}

  @Get('related/:productId')
  getRelated(@Param('productId') productId: string) {
    return this.recommendationClient.send({ cmd: 'get_related_products' }, productId);
  }

  @Get('user/:userId')
  getPersonalized(@Param('userId') userId: string) {
    return this.recommendationClient.send({ cmd: 'get_personalized_recommendations' }, userId);
  }
}
