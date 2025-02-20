import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await this.usersService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) return null;

    return user;
  }

  async login(user: UserDocument) {
    const userId = (user._id as Types.ObjectId).toString();

    const payload = {
      email: user.email,
      sub: userId,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    return { access_token, refresh_token };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) return null;

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) return null;

    const payload = {
      email: user.email,
      sub: userId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }

  async logout(userId: string) {
    return this.usersService.updateRefreshToken(userId, null);
  }
}
