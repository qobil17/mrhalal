import { Field, ID, ObjectType, Int, Float } from '@nestjs/graphql';
import { Unit } from '@libs/types';

@ObjectType()
export class ProductImageType {
  @Field(() => ID)
  id: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isPrimary: boolean;
}

@ObjectType()
export class Product {
  @Field(() => ID)
  id: number;

  @Field()
  slug: string;

  @Field(() => Int)
  categoryId: number;

  @Field()
  nameUz: string;

  @Field()
  nameKo: string;

  @Field()
  nameAr: string;

  @Field()
  nameEn: string;

  @Field({ nullable: true })
  descriptionUz?: string;

  @Field({ nullable: true })
  descriptionKo?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  comparePrice?: number;

  @Field()
  currency: string;

  @Field(() => Int)
  stockQuantity: number;

  @Field(() => Unit)
  unit: Unit;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field()
  isActive: boolean;

  @Field()
  isFeatured: boolean;

  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  soldCount: number;

  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  reviewCount: number;

  @Field(() => [ProductImageType])
  images: ProductImageType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  list: Product[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
