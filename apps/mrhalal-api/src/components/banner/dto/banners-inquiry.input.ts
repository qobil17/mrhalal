import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

@InputType()
export class BannersInquiry {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 50 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
