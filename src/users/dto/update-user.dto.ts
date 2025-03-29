import {
  IsEmail,
  IsOptional,
  MinLength,
  IsString,
  IsIn,
} from 'class-validator';
import { UserRole } from 'src/types';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'Role must be user or admin' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  cartId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
