import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

@Schema({ timestamps: true })
export class Order {
  // Если пользователь авторизован, сюда пишем его _id
  // Иначе null
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  userId?: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: {
          type: MongooseSchema.Types.ObjectId,
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

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ required: false, default: null })
  phone?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
