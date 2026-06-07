import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

@InputType()
export class UpdateAddressInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  recipientName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^01[0-9]{8,9}$/)
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(10)
  postalCode?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine1?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
