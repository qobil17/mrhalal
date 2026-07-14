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
export class CreateBannerInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @Field()
  @IsUrl({}, { message: 'Image URL must be valid' })
  imageUrl: string;

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
