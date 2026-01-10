import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from '@chommie/shared-types';

@Controller('products')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productClient.send({ cmd: 'createProduct' }, createProductDto);
  }

  @Get()
  findAll() {
    return this.productClient.send({ cmd: 'findAllProducts' }, {});
  }

  @Get('search/query')
  search(@Query('q') query: string) {
    return this.productClient.send({ cmd: 'searchProducts' }, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'findOneProduct' }, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productClient.send({ cmd: 'updateProduct' }, { id, updateProductDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'removeProduct' }, id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productClient.send({ cmd: 'findProductsByCategory' }, category);
  }
}
