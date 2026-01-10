import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from './wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
  ) {}

  async getWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistModel.findOne({ userId }).populate('products').exec();
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({ userId, products: [] });
    }
    return wishlist;
  }

  async addProduct(userId: string, productId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistModel.findOne({ userId });
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({ userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }
    return this.getWishlist(userId);
  }

  async removeProduct(userId: string, productId: string): Promise<Wishlist> {
    await this.wishlistModel.updateOne(
      { userId },
      { $pull: { products: productId } }
    );
    return this.getWishlist(userId);
  }
}
