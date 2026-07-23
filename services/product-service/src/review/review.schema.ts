import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  title: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 0 })
  helpfulVotes: number;

  @Prop([String])
  images: string[];

  @Prop()
  vendorResponse: string;

  @Prop()
  respondedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
