import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserRole } from 'src/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userModel
      .findOne({ email: registerDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'user',
    });
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().lean().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUserRole: UserRole,
  ): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (currentUserRole !== 'admin' && 'role' in updateUserDto) {
      delete updateUserDto.role;
    }

    return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
      runValidators: true,
    });
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async comparePasswords(
    plainText: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, hashedPassword);
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async updateCartId(userId: string, cartId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { cartId }).exec();
  }

  async addOrderToUser(userId: string, orderId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $push: { orders: orderId },
      })
      .exec();
  }
}
