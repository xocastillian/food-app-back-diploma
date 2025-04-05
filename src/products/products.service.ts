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

  async findWithFilters(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    sort?: string,
    search?: string,
  ): Promise<Product[]> {
    const filter: any = {};

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let query = this.productModel.find(filter).populate('categoryId');

    switch (sort) {
      case 'priceAsc':
        query = query.sort({ price: 1 });
        break;
      case 'priceDesc':
        query = query.sort({ price: -1 });
        break;
      case 'new':
        query = query.sort({ createdAt: -1 });
        break;
      default:
        break;
    }

    return query
      .skip((page - 1) * limit)
      .limit(limit)
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
