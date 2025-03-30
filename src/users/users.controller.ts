import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
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
import { AuthenticatedRequest } from 'src/types';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this.authService.login(user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'user')
  async getUser(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = req.user;

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('You can only update your own account');
    }

    if (user.role !== 'admin' && updateUserDto.role) {
      throw new ForbiddenException('You are not allowed to change role');
    }

    return this.usersService.update(id, updateUserDto, user.role);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteUser(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    return this.usersService.remove(id);
  }
}
