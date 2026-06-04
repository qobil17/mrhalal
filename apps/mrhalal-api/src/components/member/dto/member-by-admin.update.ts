import { Field, Int, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsBoolean, IsInt, MaxLength } from 'class-validator';
import { Language, MemberRole } from '@libs/types';

@InputType()
export class MemberByAdminUpdate {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
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

  @Field(() => MemberRole, { nullable: true })
  @IsOptional()
  role?: MemberRole;

  @Field(() => Language, { nullable: true })
  @IsOptional()
  language?: Language;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
