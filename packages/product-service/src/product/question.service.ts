import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async ask(data: { productId: string; userId: string; userName: string; text: string }) {
    const question = new this.questionModel({ ...data, answers: [] });
    return question.save();
  }

  async answer(questionId: string, data: { userId: string; userName: string; text: string; isVendor: boolean }) {
    return this.questionModel.findByIdAndUpdate(
      questionId,
      { $push: { answers: data } },
      { new: true }
    ).exec();
  }

  async findByProduct(productId: string) {
    return this.questionModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  async findByVendor(productIds: string[]) {
    return this.questionModel.find({ productId: { $in: productIds } }).sort({ createdAt: -1 }).exec();
  }
}
