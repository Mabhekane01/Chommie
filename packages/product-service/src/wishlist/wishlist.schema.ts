import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: string[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
