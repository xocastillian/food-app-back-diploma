import { IsString, IsIn } from 'class-validator';
import { OrderStatus } from 'src/types';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['accepted', 'delivered', 'canceled', 'pending', 'handed_to_courier'])
  status: OrderStatus;
}
