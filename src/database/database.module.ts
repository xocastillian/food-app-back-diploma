import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
