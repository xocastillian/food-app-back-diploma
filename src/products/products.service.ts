import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findById(
      createProductDto.categoryId,
    );
    if (!category) throw new NotFoundException('Категория не найдена');

    try {
      return await this.productModel.create({
        ...createProductDto,
        categoryId: new Types.ObjectId(createProductDto.categoryId),
      });
    } catch (error) {
      throw new BadRequestException(
        'Ошибка при создании продукта: ' + error.message,
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Product[]> {
    return this.productModel
      .find()
      .populate('categoryId')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productModel
      .find({ categoryId: new Types.ObjectId(categoryId) })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId')
      .exec();
    if (!product) throw new NotFoundException('Продукт не найден');
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatePayload: any = { ...updateProductDto };

    if (updateProductDto.categoryId) {
      const category = await this.categoriesService.findById(
        updateProductDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
      updatePayload.categoryId = new Types.ObjectId(
        updateProductDto.categoryId,
      );
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true },
    );

    if (!updatedProduct) throw new NotFoundException('Продукт не найден');

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Продукт не найден');
  }
}
