import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

@InputType()
export class ProductsInquiry {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
