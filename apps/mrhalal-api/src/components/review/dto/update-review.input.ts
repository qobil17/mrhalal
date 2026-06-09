import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';

@InputType()
export class UpdateReviewInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(2000)
  comment?: string;
}
