import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto } from '@chommie/shared-types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return this.productModel.find({ _id: { $in: ids } }).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productModel.find({ category }).exec();
  }

  async findFiltered(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    isLightningDeal?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    query?: string;
  }): Promise<Product[]> {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isLightningDeal) {
      query.isLightningDeal = true;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.minRating !== undefined) {
      query.ratings = { $gte: filters.minRating };
    }

    if (filters.inStock) {
      query.stock = { $gt: 0 };
    }

    if (filters.query) {
      query.$or = [
        { name: { $regex: filters.query, $options: 'i' } },
        { description: { $regex: filters.query, $options: 'i' } },
        { category: { $regex: filters.query, $options: 'i' } },
      ];
    }

    let sort: any = { createdAt: -1 };
    if (filters.sortBy) {
      sort = { [filters.sortBy]: filters.sortOrder === 'desc' ? -1 : 1 };
    }

    return this.productModel.find(query).sort(sort).exec();
  }

  async getDailyDeals(): Promise<Product[]> {
    return this.productModel.find({
      discountPrice: { $exists: true, $gt: 0 },
      dealEndsAt: { $gt: new Date() }
    }).limit(10).exec();
  }

  async findByVendor(vendorId: string): Promise<Product[]> {
    return this.productModel.find({ vendorId }).exec();
  }

  async search(query: string): Promise<Product[]> {
    return this.productModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).exec();
  }

  async suggest(query: string): Promise<{ suggestions: string[] }> {
    if (!query || query.length < 2) return { suggestions: [] };

    const products = await this.productModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('name category').exec();

    const suggestions = new Set<string>();
    
    products.forEach(p => {
      if (p.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(p.name);
      }
      if (p.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(p.category);
      }
    });

    return { suggestions: Array.from(suggestions).slice(0, 8) };
  }

  async checkStock(id: string, quantity: number): Promise<boolean> {
    const product = await this.productModel.findById(id).exec();
    return product ? product.stock >= quantity : false;
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    product.stock -= quantity;
    return product.save();
  }
}
