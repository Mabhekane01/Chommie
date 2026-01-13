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

  @Get('frequently-bought/:productId')
  getFrequentlyBought(@Param('productId') productId: string) {
    return this.recommendationClient.send({ cmd: 'get_frequently_bought_together' }, productId);
  }

  @Get('comparison/:productId')
  getComparison(@Param('productId') productId: string) {
    return this.recommendationClient.send({ cmd: 'get_product_comparison' }, productId);
  }

  @Get('user/:userId')
  getPersonalized(@Param('userId') userId: string) {
    return this.recommendationClient.send({ cmd: 'get_personalized_recommendations' }, userId);
  }
}
