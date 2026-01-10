import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '@chommie/shared-types';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'createProduct' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'findAllProducts' })
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern({ cmd: 'findOneProduct' })
  findOne(@Payload() id: string) {
    return this.productService.findOne(id);
  }

  @MessagePattern({ cmd: 'updateProduct' })
  update(@Payload() data: { id: string; updateProductDto: UpdateProductDto }) {
    return this.productService.update(data.id, data.updateProductDto);
  }

  @MessagePattern({ cmd: 'removeProduct' })
  remove(@Payload() id: string) {
    return this.productService.remove(id);
  }

  @MessagePattern({ cmd: 'findProductsByCategory' })
  findByCategory(@Payload() category: string) {
    return this.productService.findByCategory(category);
  }

  @MessagePattern({ cmd: 'searchProducts' })
  search(@Payload() query: string) {
    return this.productService.search(query);
  }

  @MessagePattern({ cmd: 'check_stock' })
  checkStock(@Payload() data: { id: string; quantity: number }) {
    return this.productService.checkStock(data.id, data.quantity);
  }

  @MessagePattern({ cmd: 'decrement_stock' })
  decrementStock(@Payload() data: { id: string; quantity: number }) {
    return this.productService.decrementStock(data.id, data.quantity);
  }
}
