import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RecommendationsService {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
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

  async getFrequentlyBoughtTogether(productId: string) {
    // 1. Get current product
    const product = await lastValueFrom(this.productClient.send({ cmd: 'findOneProduct' }, productId));
    if (!product) return [];

    // 2. Heuristic: Find 2 other high-rated products in same category
    const categoryProducts = await lastValueFrom(this.productClient.send({ cmd: 'findProductsByCategory' }, product.category));
    
    return (categoryProducts as any[])
      .filter(p => p._id !== productId)
      .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
      .slice(0, 2);
  }

  async getProductComparison(productId: string) {
    // 1. Get current product
    const product = await lastValueFrom(this.productClient.send({ cmd: 'findOneProduct' }, productId));
    if (!product) return [];

    // 2. Find 3 similar products (same category)
    const categoryProducts = await lastValueFrom(this.productClient.send({ cmd: 'findProductsByCategory' }, product.category));
    
    const comparisons = (categoryProducts as any[])
      .filter(p => p._id !== productId)
      .slice(0, 3);

    return [product, ...comparisons];
  }

  async getAlsoViewed(productId: string) {
    // 1. Get current product
    const product = await lastValueFrom(this.productClient.send({ cmd: 'findOneProduct' }, productId));
    if (!product) return [];

    // 2. Find products in same category, shuffle and take 6
    const categoryProducts = await lastValueFrom(this.productClient.send({ cmd: 'findProductsByCategory' }, product.category));
    
    return (categoryProducts as any[])
      .filter(p => p._id !== productId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  }

  async getPersonalizedRecommendations(userId: string) {
    try {
      // 1. Get user profile to find favorite category
      const profile = await lastValueFrom(this.authClient.send({ cmd: 'get_profile' }, { userId }));
      
      if (profile && profile.favoriteCategory) {
        // 2. Recommend products from their favorite category
        return lastValueFrom(this.productClient.send({ cmd: 'findProductsByCategory' }, profile.favoriteCategory));
      }
    } catch (e) {
      console.error('Failed to get personalized recommendations:', e);
    }
    
    // Fallback to all products
    return lastValueFrom(this.productClient.send({ cmd: 'findAllProducts' }, {}));
  }

  async getProductInsight(productId: string) {
    // In a real app, this would use an LLM (like Gemini) to summarize reviews.
    // For this demo, we'll generate a high-quality heuristic summary.
    const product = await lastValueFrom(this.productClient.send({ cmd: 'findOneProduct' }, productId));
    if (!product) return null;

    return {
      summary: `Customers generally praise the ${product.name} for its ${product.category.toLowerCase()}-leading performance and reliability. Common highlights include exceptional build quality and ease of use.`,
      pros: ['High performance', 'Durable design', 'Great value for money'],
      cons: ['Premium pricing', 'Limited color options'],
      sentiment: 'Highly Positive',
      aiConfidence: 0.94
    };
  }
}
