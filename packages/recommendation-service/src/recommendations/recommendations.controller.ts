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

  @MessagePattern({ cmd: 'get_personalized_recommendations' })
  getPersonalized(@Payload() userId: string) {
    return this.recommendationsService.getPersonalizedRecommendations(userId);
  }
}
