import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}
