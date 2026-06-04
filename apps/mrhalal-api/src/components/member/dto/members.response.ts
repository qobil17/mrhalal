import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Member } from '@libs/types';

@ObjectType()
export class MembersResponse {
  @Field(() => [Member])
  list: Member[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
