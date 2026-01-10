import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(data: { productId: string; userId: string; userName: string; rating: number; comment: string }) {
    const review = new this.reviewModel(data);
    await review.save();
    await this.updateProductRating(data.productId);
    return review;
  }

  async findByProduct(productId: string) {
    return this.reviewModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: new Object(productId) } }, // Ensure ObjectId casting if needed, but string might work with mongoose automagic
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
