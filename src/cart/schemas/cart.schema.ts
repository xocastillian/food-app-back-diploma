import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type CartDocument = Cart & Document;

export class CartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: false })
  sessionId?: string;

  @Prop({
    type: [
      {
        productId: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items: CartItem[];

  @Prop({ required: false })
  expiresAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

CartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });
