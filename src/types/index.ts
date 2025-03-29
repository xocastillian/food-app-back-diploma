import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export type UserRole = 'user' | 'admin';

export class CartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}

export type OrderStatus = 'accepted' | 'delivered' | 'canceled';
