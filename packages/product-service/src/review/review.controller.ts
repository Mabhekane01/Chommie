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

  @MessagePattern({ cmd: 'get_vendor_reviews' })
  findByVendor(@Payload() vendorId: string) {
    return this.reviewService.findByVendor(vendorId);
  }

  @MessagePattern({ cmd: 'vote_helpful' })
  voteHelpful(@Payload() reviewId: string) {
    return this.reviewService.voteHelpful(reviewId);
  }

  @MessagePattern({ cmd: 'add_review_response' })
  addResponse(@Payload() data: { reviewId: string; response: string }) {
    return this.reviewService.addResponse(data.reviewId, data.response);
  }

  @MessagePattern({ cmd: 'create_seller_review' })
  createSellerReview(@Payload() data: any) {
    return this.reviewService.createSellerReview(data);
  }

  @MessagePattern({ cmd: 'get_seller_reviews' })
  getSellerReviews(@Payload() vendorId: string) {
    return this.reviewService.findByVendorId(vendorId);
  }
}
