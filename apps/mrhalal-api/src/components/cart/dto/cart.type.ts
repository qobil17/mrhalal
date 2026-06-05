import { Field, ID, ObjectType, Int, Float } from '@nestjs/graphql';
import { Product } from '../../product/dto/product.type';

@ObjectType()
export class CartItemType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Product)
  product: Product;

  @Field(() => Float)
  subtotal: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class CartType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  memberId: number;

  @Field(() => [CartItemType])
  items: CartItemType[];

  @Field(() => Float)
  total: number;

  @Field(() => Int)
  itemCount: number;

  @Field()
  currency: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
