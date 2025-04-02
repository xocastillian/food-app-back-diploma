import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from 'src/users/users.service';
import { OrderStatus } from 'src/types';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private readonly gateway: OrderGateway,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order> {
    const items = createOrderDto.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      price: item.price,
    }));

    const totalPrice = items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );

    const orderData: Partial<Order> = {
      items,
      totalPrice,
      status: 'pending',
      phone: createOrderDto.phone,
      address: createOrderDto.address ?? null,
      recipientName: createOrderDto.recipientName ?? null,
    };

    if (userId) {
      orderData.userId = new Types.ObjectId(userId);
    }

    const newOrder = await this.orderModel.create(orderData);

    if (userId) {
      await this.usersService.addOrderToUser(userId, newOrder._id.toString());
    }

    this.gateway.notifyNewOrder(newOrder);

    return newOrder;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('items.productId').exec();
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('items.productId')
      .exec();
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    order.status = newStatus;
    await order.save();
    return order;
  }
}
