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

  @Get('filter')
  findFiltered(@Query() filters: any) {
    // Convert string numbers to actual numbers if they exist
    if (filters.minPrice) filters.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) filters.maxPrice = parseFloat(filters.maxPrice);
    if (filters.minRating) filters.minRating = parseFloat(filters.minRating);
    if (filters.inStock === 'true') filters.inStock = true;
    if (filters.inStock === 'false') filters.inStock = false;
    
    return this.productClient.send({ cmd: 'findFilteredProducts' }, filters);
  }

  @Get('search/query')
  search(@Query('q') query: string) {
    return this.productClient.send({ cmd: 'searchProducts' }, query);
  }

  @Get('search/suggest')
  suggest(@Query('q') query: string) {
    return this.productClient.send({ cmd: 'search_suggestions' }, query);
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

  @Get('vendor/:vendorId')
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.productClient.send({ cmd: 'get_vendor_products' }, vendorId);
  }

  @Post('questions')
  askQuestion(@Body() data: any) {
    return this.productClient.send({ cmd: 'ask_question' }, data);
  }

  @Post('questions/:id/answer')
  answerQuestion(@Param('id') id: string, @Body() data: any) {
    return this.productClient.send({ cmd: 'answer_question' }, { questionId: id, answer: data });
  }

  @Get(':id/questions')
  getQuestions(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'get_product_questions' }, id);
  }

  @Get(':id/delivery-estimation')
  getDeliveryEstimation(@Param('id') id: string, @Query('zipCode') zipCode?: string) {
    let days = 5;
    if (zipCode) {
      if (zipCode.startsWith('20') || zipCode.startsWith('21')) days = 2; // Gauteng
      else if (zipCode.startsWith('7')) days = 3; // Cape Town
      else if (zipCode.startsWith('4')) days = 3; // Durban
      else if (zipCode.startsWith('0')) days = 4; // Pretoria/Other
    }

    const estimate = new Date();
    estimate.setDate(estimate.getDate() + days);
    
    return {
      estimatedDate: estimate,
      days,
      formattedDate: estimate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
    };
  }
}
