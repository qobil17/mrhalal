import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
