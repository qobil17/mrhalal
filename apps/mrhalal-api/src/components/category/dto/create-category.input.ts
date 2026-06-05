import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameUz: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameKo: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameAr: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameEn: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @IsOptional()
  image?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
