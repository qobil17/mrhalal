import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { Product } from '../../product/dto/product.type';

@ObjectType()
export class WishlistItemType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Product)
  product: Product;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class WishlistResponse {
  @Field(() => [WishlistItemType])
  items: WishlistItemType[];

  @Field(() => Int)
  total: number;
}
