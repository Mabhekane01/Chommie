import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './product.schema';
import { Question, QuestionSchema } from './question.schema';
import { QuestionService } from './question.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, QuestionService],
  exports: [ProductService, QuestionService],
})
export class ProductModule {}
