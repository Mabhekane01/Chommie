import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from '@chommie/shared-types';
import { AdminGuard } from '../auth/admin.guard';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/** Catalogue reads are public; catalogue mutations are Chommie ops (admin-only). */
@Controller('products')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @UseGuards(AdminGuard)
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

  /**
   * Batch lookup for basket revalidation — declared before `:id` so the
   * dynamic route doesn't swallow it. Capped to keep one request cheap.
   */
  @Get('batch')
  findByIds(@Query('ids') ids?: string) {
    const list = (ids ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 100);
    if (list.length === 0) return [];
    return this.productClient.send({ cmd: 'findProductsByIds' }, list);
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

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productClient.send({ cmd: 'updateProduct' }, { id, updateProductDto });
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productClient.send({ cmd: 'removeProduct' }, id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productClient.send({ cmd: 'findProductsByCategory' }, category);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('questions')
  askQuestion(@CurrentUser() user: AuthUser, @Body() data: any) {
    return this.productClient.send(
      { cmd: 'ask_question' },
      { ...data, userId: user.id, userName: user.email?.split('@')[0] ?? 'Member' },
    );
  }

  // Official answers come from Chommie ops.
  @UseGuards(AdminGuard)
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
