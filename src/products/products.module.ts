import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { CategoriesModule } from '../categories/categories.module';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from '../cloudinary/cloudinary.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) =>
        configureCloudinary(configService),
      inject: [ConfigService],
    },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
