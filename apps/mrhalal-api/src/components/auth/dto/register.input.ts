import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, Matches, MinLength, MaxLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, {
    message: 'Phone must be a valid Korean number (e.g., 01012345678)',
  })
  phone: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password too long' })
  password: string;

  @Field()
  @IsString()
  @MinLength(2, { message: 'First name too short' })
  @MaxLength(50, { message: 'First name too long' })
  firstName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @Field({ nullable: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;
}
