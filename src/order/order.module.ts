import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { UsersModule } from '../users/users.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
  exports: [OrderService],
})
export class OrderModule {}
