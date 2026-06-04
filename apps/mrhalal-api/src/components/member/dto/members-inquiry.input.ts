import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { MemberRole } from '@libs/types';

@InputType()
export class MembersInquiry {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => MemberRole, { nullable: true })
  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
}
