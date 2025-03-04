import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}
