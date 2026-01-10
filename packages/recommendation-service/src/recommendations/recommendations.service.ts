import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RecommendationsService {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async getRelatedProducts(productId: string) {
    // 1. Get the current product to find its category
    const product = await lastValueFrom(this.productClient.send({ cmd: 'findOneProduct' }, productId));
    
    if (!product) return [];

    // 2. Fetch other products in the same category
    const related = await lastValueFrom(this.productClient.send({ cmd: 'findProductsByCategory' }, product.category));

    // 3. Filter out the current product and limit to 4
    return (related as any[])
      .filter(p => p._id !== productId)
      .slice(0, 4);
  }

  async getPersonalizedRecommendations(userId: string) {
    // In a production environment, this would involve ML models or tracking user behavior.
    // For now, we return popular products or a hybrid of categories the user has interacted with.
    // We will fallback to all products for the MVP.
    return lastValueFrom(this.productClient.send({ cmd: 'findAllProducts' }, {}));
  }
}
