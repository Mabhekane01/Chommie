import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Review, ReviewDocument } from './review.schema';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  async create(data: { productId: string; userId: string; userName: string; rating: number; title: string; comment: string; images?: string[] }) {
    // Check Verified Purchase
    let verified = false;
    try {
      verified = await lastValueFrom(
        this.orderClient.send({ cmd: 'check_purchase' }, { userId: data.userId, productId: data.productId })
      );
    } catch (e) {
      console.error('Failed to check purchase status', e);
    }

    const review = new this.reviewModel({
      ...data,
      verified: !!verified
    });
    
    await review.save();
    await this.updateProductRating(data.productId);
    return review;
  }

  async voteHelpful(reviewId: string) {
    return this.reviewModel.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    ).exec();
  }

  async addResponse(reviewId: string, response: string) {
    return this.reviewModel.findByIdAndUpdate(
      reviewId,
      { 
        vendorResponse: response,
        respondedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async findByProduct(productId: string) {
    return this.reviewModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId) } }, 
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.productModel.findByIdAndUpdate(productId, {
        ratings: stats[0].avgRating,
        numReviews: stats[0].numReviews,
      });
    }
  }
}
