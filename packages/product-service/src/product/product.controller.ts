import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { QuestionService } from './question.service';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly questionService: QuestionService
  ) {}

  @MessagePattern({ cmd: 'findAllProducts' })
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern({ cmd: 'findOneProduct' })
  findOne(@Payload() id: string) {
    return this.productService.findOne(id);
  }

  @MessagePattern({ cmd: 'findProductsByCategory' })
  findByCategory(@Payload() category: string) {
    return this.productService.findByCategory(category);
  }

  @MessagePattern({ cmd: 'filterProducts' })
  findFiltered(@Payload() filters: any) {
    return this.productService.findFiltered(filters);
  }

  @MessagePattern({ cmd: 'createProduct' })
  create(@Payload() data: any) {
    return this.productService.create(data);
  }

  @MessagePattern({ cmd: 'updateProduct' })
  update(@Payload() data: { id: string; product: any }) {
    return this.productService.update(data.id, data.product);
  }

  @MessagePattern({ cmd: 'deleteProduct' })
  remove(@Payload() id: string) {
    return this.productService.remove(id);
  }

  @MessagePattern({ cmd: 'check_stock' })
  checkStock(@Payload() data: { id: string; quantity: number }) {
    return this.productService.checkStock(data.id, data.quantity);
  }

  @MessagePattern({ cmd: 'decrement_stock' })
  decrementStock(@Payload() data: { id: string; quantity: number }) {
    return this.productService.decrementStock(data.id, data.quantity);
  }

  @MessagePattern({ cmd: 'get_vendor_products' })
  findByVendor(@Payload() vendorId: string) {
    return this.productService.findByVendor(vendorId);
  }

  // Q&A
  @MessagePattern({ cmd: 'ask_question' })
  askQuestion(@Payload() data: any) {
    return this.questionService.ask(data);
  }

  @MessagePattern({ cmd: 'answer_question' })
  answerQuestion(@Payload() data: { questionId: string; answer: any }) {
    return this.questionService.answer(data.questionId, data.answer);
  }

  @MessagePattern({ cmd: 'get_product_questions' })
  getQuestions(@Payload() productId: string) {
    return this.questionService.findByProduct(productId);
  }
}
