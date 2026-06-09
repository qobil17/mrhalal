import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class ReviewsInquiry {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}
