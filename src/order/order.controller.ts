import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtOptionalAuthGuard } from 'src/auth/guards/jwt-optional.guard';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrderService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getUserOrders(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      return [];
    }
    return this.ordersService.getOrdersByUser(userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto.status);
  }
}
