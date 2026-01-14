import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecommendationsService } from './recommendations.service';

@Controller()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @MessagePattern({ cmd: 'get_related_products' })
  getRelated(@Payload() productId: string) {
    return this.recommendationsService.getRelatedProducts(productId);
  }

  @MessagePattern({ cmd: 'get_frequently_bought_together' })
  getFrequentlyBoughtTogether(@Payload() productId: string) {
    return this.recommendationsService.getFrequentlyBoughtTogether(productId);
  }

  @MessagePattern({ cmd: 'get_product_comparison' })
  getProductComparison(productId: string) {
    return this.recommendationsService.getProductComparison(productId);
  }

  @MessagePattern({ cmd: 'get_also_viewed' })
  getAlsoViewed(productId: string) {
    return this.recommendationsService.getAlsoViewed(productId);
  }

  @MessagePattern({ cmd: 'get_personalized_recommendations' })
  getPersonalized(@Payload() userId: string) {
    return this.recommendationsService.getPersonalizedRecommendations(userId);
  }

  @MessagePattern({ cmd: 'get_product_insight' })
  getProductInsight(@Payload() productId: string) {
    return this.recommendationsService.getProductInsight(productId);
  }
}
