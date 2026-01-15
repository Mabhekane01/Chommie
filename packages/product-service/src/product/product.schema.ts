import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 'PENDING_REVIEW' })
  approvalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

  @Prop({ default: 'FBC' })
  fulfillmentType: 'FBC' | 'FBM'; // FBC = Fulfilled by Chommie (Warehouse), FBM = Merchant

  @Prop([String])
  images: string[];

  @Prop({ default: 0 })
  ratings: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: true })
  bnplEligible: boolean;

  @Prop({ default: 0 })
  trustScoreDiscount: number;

  @Prop()
  discountPrice?: number;

  @Prop()
  dealEndsAt?: Date;

  @Prop({ default: false })
  isLightningDeal: boolean;

  @Prop({ default: 0 })
  lightningDealStock: number;

  @Prop({ default: 0 })
  lightningDealSold: number;

  @Prop({ type: [{ name: String, options: [{ value: String, priceModifier: Number, stock: Number, image: String }] }] })
  variants?: any[];

  @Prop([String])
  badges?: string[];

  @Prop({ type: [{ minQuantity: Number, discountPercentage: Number }] })
  bulkPricing?: { minQuantity: number, discountPercentage: number }[];

  @Prop({ required: true })
  vendorId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
