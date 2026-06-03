import { Field, ObjectType } from '@nestjs/graphql';
import { Member } from '@libs/types';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => Member)
  member: Member;
}
