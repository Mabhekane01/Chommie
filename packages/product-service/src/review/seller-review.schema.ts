import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SellerReviewDocument = SellerReview & Document;

@Schema({ timestamps: true })
export class SellerReview {
  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  verifiedPurchase: boolean;
}

export const SellerReviewSchema = SchemaFactory.createForClass(SellerReview);
