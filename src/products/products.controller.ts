import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject('CLOUDINARY')
    private readonly cloudinaryInstance: typeof cloudinary,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не предоставлен');

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return categoryId
      ? this.productsService.findByCategory(categoryId)
      : this.productsService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
