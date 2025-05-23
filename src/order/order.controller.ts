import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtOptionalAuthGuard } from 'src/auth/guards/jwt-optional.guard';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-order.dto';
import { AuthenticatedRequest } from 'src/types';

@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrderService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getUserOrders(
    @Req() req: AuthenticatedRequest,
    @Query('userId') userIdQuery?: string,
  ) {
    const userId = req.user?.userId ?? userIdQuery;
    if (!userId) {
      throw new BadRequestException('userId обязателен для получения заказов');
    }
    return this.ordersService.getOrdersByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin')
  async getAllOrders() {
    return this.ordersService.getAllOrders();
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin/has-new')
  async hasNewOrders() {
    return this.ordersService.hasNewOrders();
  }
}
