import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  rating: number;

  @Field()
  @IsString()
  @MinLength(5, { message: 'Comment must be at least 5 characters' })
  @MaxLength(2000)
  comment: string;
}
