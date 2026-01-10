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

  @Prop({ required: true })
  vendorId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
