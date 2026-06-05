import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: number;

  @Field()
  slug: string;

  @Field()
  nameUz: string;

  @Field()
  nameKo: string;

  @Field()
  nameAr: string;

  @Field()
  nameEn: string;

  @Field({ nullable: true })
  image?: string;

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
export class CategoriesResponse {
  @Field(() => [Category])
  list: Category[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
