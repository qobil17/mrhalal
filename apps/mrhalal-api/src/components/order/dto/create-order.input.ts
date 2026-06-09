import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  addressId?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
