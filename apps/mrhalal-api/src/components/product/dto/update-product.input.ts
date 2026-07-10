import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Unit, ProductLabel } from '@libs/types';
import { ProductImageInput } from './product-image.input';

@InputType()
export class UpdateProductInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  nameUz?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  nameKo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  nameAr?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  nameEn?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionUz?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionKo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionAr?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionEn?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @Field(() => Unit, { nullable: true })
  @IsEnum(Unit)
  @IsOptional()
  unit?: Unit;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Field(() => ProductLabel, { nullable: true })
  @IsEnum(ProductLabel)
  @IsOptional()
  label?: ProductLabel;

  @Field(() => [ProductImageInput], { nullable: true })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  @IsOptional()
  images?: ProductImageInput[];
}
