import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Language, MemberRole } from './enums';

@ObjectType()
export class Member {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => MemberRole)
  role: MemberRole;

  @Field(() => Language)
  language: Language;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
