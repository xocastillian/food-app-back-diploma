import { IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['accepted', 'delivered', 'canceled'])
  status: string;
}
