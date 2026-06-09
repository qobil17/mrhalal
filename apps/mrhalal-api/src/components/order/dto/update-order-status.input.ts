import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsEnum } from 'class-validator';
import { OrderStatus } from '@libs/types';

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
