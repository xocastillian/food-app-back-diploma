import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from 'src/types';

export type OrderDocument = Order & Document;

export class OrderItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  userId?: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: OrderItem[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    default: 'pending',
    enum: ['accepted', 'delivered', 'canceled', 'pending'],
  })
  status: OrderStatus;

  @Prop({ required: false, default: null })
  phone?: string;

  @Prop({ required: false, default: null })
  address?: string;

  @Prop({ required: false, default: null })
  recipientName?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
