import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Banner {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  imageUrl: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BannersResponse {
  @Field(() => [Banner])
  list: Banner[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
