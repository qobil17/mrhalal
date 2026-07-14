import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDate,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Unit, ProductLabel } from '@libs/types';
import { ProductImageInput } from './product-image.input';

@InputType()
export class CreateProductInput {
  @Field(() => Int)
  @IsInt()
  categoryId: number;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameUz: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameKo: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameAr: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameEn: string;

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

  @Field(() => Float)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @Field({ defaultValue: 'KRW' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsOptional()
  currency?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @Field(() => Unit, { defaultValue: Unit.KG })
  @IsEnum(Unit)
  @IsOptional()
  unit?: Unit;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => ProductLabel, { nullable: true })
  @IsEnum(ProductLabel)
  @IsOptional()
  label?: ProductLabel;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @Field(() => [ProductImageInput], { nullable: true })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  @IsOptional()
  images?: ProductImageInput[];
}
