import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtOptionalAuthGuard } from 'src/auth/guards/jwt-optional.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(JwtOptionalAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get()
  async getUserOrders(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      return [];
    }
    return this.ordersService.getOrdersByUser(userId);
  }

  @Get(':id')
  async getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }
}
