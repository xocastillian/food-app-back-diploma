import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartsService } from './cart.service';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(@Req() req: any) {
    const userId = req.user.userId;
    const cart = await this.cartsService.getOrCreateCart(userId);
    return cart;
  }

  @Post('items')
  async addItem(@Body() addItemDto: AddItemDto, @Req() req: any) {
    const userId = req.user.userId;
    const cart = await this.cartsService.getOrCreateCart(userId);
    return this.cartsService.addItem(cart._id.toString(), addItemDto);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const cart = await this.cartsService.getOrCreateCart(userId);
    return this.cartsService.updateItem(
      cart._id.toString(),
      itemId,
      updateItemDto,
    );
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string, @Req() req: any) {
    const userId = req.user.userId;
    const cart = await this.cartsService.getOrCreateCart(userId);
    return this.cartsService.removeItem(cart._id.toString(), itemId);
  }

  @Delete()
  async clearCart(@Req() req: any) {
    const userId = req.user.userId;
    const cart = await this.cartsService.getOrCreateCart(userId);
    return this.cartsService.clearCart(cart._id.toString());
  }
}
