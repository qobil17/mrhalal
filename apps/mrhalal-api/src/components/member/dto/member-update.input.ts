import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';
import { Language } from '@libs/types';

@InputType()
export class MemberUpdateInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatar?: string;

  @Field(() => Language, { nullable: true })
  @IsOptional()
  language?: Language;
}
