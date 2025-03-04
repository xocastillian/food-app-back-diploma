import { IsEmail, IsOptional, MinLength, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  @IsString()
  cartId?: string;
}
