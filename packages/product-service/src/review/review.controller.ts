import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from './review.service';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({ cmd: 'create_review' })
  create(@Payload() data: any) {
    return this.reviewService.create(data);
  }

  @MessagePattern({ cmd: 'get_product_reviews' })
  findByProduct(@Payload() productId: string) {
    return this.reviewService.findByProduct(productId);
  }
}
