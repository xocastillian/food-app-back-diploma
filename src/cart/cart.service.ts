import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateCart(userId: string): Promise<CartDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.cartId) {
      const existingCart = await this.cartModel.findById(user.cartId);
      if (existingCart) {
        return existingCart;
      }
    }

    const newCart = await this.cartModel.create({
      userId: new Types.ObjectId(userId),
      items: [],
    });

    await this.usersService.update(userId, {
      cartId: newCart._id.toString(),
    });
    return newCart;
  }

  async addItem(cartId: string, addItemDto: AddItemDto): Promise<CartDocument> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === addItemDto.productId,
    );
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += addItemDto.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(addItemDto.productId),
        quantity: addItemDto.quantity,
      });
    }
    return cart.save();
  }

  async updateItem(
    cartId: string,
    itemId: string,
    updateItemDto: UpdateItemDto,
  ): Promise<CartDocument> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.items.findIndex(
      (item) => item._id?.toString() === itemId,
    );
    if (itemIndex === -1) throw new NotFoundException('Item not found in cart');

    cart.items[itemIndex].quantity = updateItemDto.quantity;
    return cart.save();
  }

  async removeItem(cartId: string, itemId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const itemIndex = cart.items.findIndex(
      (item) => item._id?.toString() === itemId,
    );
    if (itemIndex === -1) throw new NotFoundException('Item not found in cart');

    cart.items.splice(itemIndex, 1);
    return cart.save();
  }

  async clearCart(cartId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = [];
    return cart.save();
  }
}
