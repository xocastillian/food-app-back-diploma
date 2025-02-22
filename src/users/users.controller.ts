import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = req.user;

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('You can only update your own account');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteUser(@Param('id') id: string, @Request() req) {
    const user = req.user;

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    return this.usersService.remove(id);
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    const newAccessToken = await this.authService.refreshToken(
      body.userId,
      body.refreshToken,
    );
    if (!newAccessToken) return { error: 'Invalid refresh token' };
    return newAccessToken;
  }
}
