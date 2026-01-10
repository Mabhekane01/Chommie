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

  async search(query: string): Promise<Product[]> {
    return this.productModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).exec();
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
