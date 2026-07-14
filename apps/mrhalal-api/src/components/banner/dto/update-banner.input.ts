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
export class UpdateBannerInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: 'Image URL must be valid' })
  @IsOptional()
  imageUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
