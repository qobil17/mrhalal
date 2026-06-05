import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';

@InputType()
export class ProductImageInput {
  @Field()
  @IsUrl({}, { message: 'Image URL must be valid' })
  url: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  alt?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
