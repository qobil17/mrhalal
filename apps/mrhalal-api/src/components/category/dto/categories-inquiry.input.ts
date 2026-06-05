import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsString, IsBoolean } from 'class-validator';

@InputType()
export class CategoriesInquiry {
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
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
