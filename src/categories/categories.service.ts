import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  async create(dto: CreateCategoryDto): Promise<Category> {
    const { name, slug, imageUrl } = dto;
    const existingCategory = await this.categoryModel.findOne({
      $or: [{ slug }, { name }],
    });
    if (existingCategory) {
      throw new ConflictException(
        'Category with given name or slug already exists',
      );
    }

    const category = await this.categoryModel.create({ name, slug, imageUrl });
    this.logger.log(`Category created: ${name}`);
    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Категория не найдена');
    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().lean().exec();
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryModel.findOne({ slug }).lean().exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Категория не найдена');
    }
    this.logger.log(`Category removed: ${id}`);
  }

  async update(id: string, updateData: UpdateCategoryDto): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedCategory) {
      throw new NotFoundException('Категория не найдена');
    }
    this.logger.log(`Category updated: ${id}`);
    return updatedCategory;
  }
}
