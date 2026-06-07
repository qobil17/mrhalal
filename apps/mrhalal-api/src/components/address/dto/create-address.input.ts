import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateAddressInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName: string;

  @Field()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, {
    message: 'Phone must be a valid Korean number (e.g., 01012345678)',
  })
  phone: string;

  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(10)
  postalCode: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  addressLine1: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
