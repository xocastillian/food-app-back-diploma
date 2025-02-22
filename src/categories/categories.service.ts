import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    name: string,
    slug: string,
    imageUrl?: string,
  ): Promise<Category> {
    return this.categoryModel.create({ name, slug, imageUrl });
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Категория не найдена');
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Категория не найдена');
  }

  async update(
    id: string,
    updateData: Partial<{ name: string; slug: string; imageUrl?: string }>,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedCategory) throw new NotFoundException('Категория не найдена');

    return updatedCategory;
  }
}
