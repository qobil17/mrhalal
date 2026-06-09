import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ReviewMemberInfo {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class ReviewType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  memberId: number;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  isApproved: boolean;

  @Field(() => ReviewMemberInfo)
  member: ReviewMemberInfo;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ReviewsResponse {
  @Field(() => [ReviewType])
  list: ReviewType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
