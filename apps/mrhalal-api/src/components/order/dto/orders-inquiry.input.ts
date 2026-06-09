import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { OrderStatus } from '@libs/types';

@InputType()
export class OrdersInquiry {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => OrderStatus, { nullable: true })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
