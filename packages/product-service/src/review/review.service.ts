import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Review, ReviewDocument } from './review.schema';
import { SellerReview, SellerReviewDocument } from './seller-review.schema';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(SellerReview.name) private sellerReviewModel: Model<SellerReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  async createSellerReview(data: any) {
    const review = new this.sellerReviewModel(data);
    await review.save();
    
    // Aggregation for Seller Rating
    const stats = await this.sellerReviewModel.aggregate([
      { $match: { vendorId: data.vendorId } },
      {
        $group: {
          _id: '$vendorId',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      // Notify Auth Service to update vendor stats
      this.authClient.emit('update_seller_stats', {
        vendorId: data.vendorId,
        rating: stats[0].avgRating,
        numRatings: stats[0].numReviews
      });
    }

    return review;
  }

  async findByVendorId(vendorId: string) {
    return this.sellerReviewModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }

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

  async findByVendor(vendorId: string) {
    // 1. Get all product IDs for this vendor
    const products = await this.productModel.find({ vendorId }).select('_id name images').exec();
    const productIds = products.map(p => p._id.toString());
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // 2. Find reviews for these products
    const reviews = await this.reviewModel.find({ productId: { $in: productIds } }).sort({ createdAt: -1 }).exec();

    // 3. Enrich reviews with product info
    return reviews.map(r => ({
      ...r.toObject(),
      productName: productMap.get(r.productId.toString())?.name,
      productImage: productMap.get(r.productId.toString())?.images[0]
    }));
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
