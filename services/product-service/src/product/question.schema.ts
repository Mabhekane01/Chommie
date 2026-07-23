import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  text: string;

  @Prop({
    type: [{
      userId: String,
      userName: String,
      text: String,
      isVendor: Boolean,
      createdAt: { type: Date, default: Date.now }
    }]
  })
  answers: {
    userId: string;
    userName: string;
    text: string;
    isVendor: boolean;
    createdAt: Date;
  }[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
