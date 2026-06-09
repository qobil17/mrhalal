import { Field, ID, ObjectType, Int, Float } from '@nestjs/graphql';
import { OrderStatus, PaymentMethod } from '@libs/types';

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field()
  productName: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  subtotal: number;
}

@ObjectType()
export class OrderAddressInfo {
  @Field()
  recipientName: string;

  @Field()
  phone: string;

  @Field()
  postalCode: string;

  @Field()
  city: string;

  @Field()
  addressLine1: string;

  @Field({ nullable: true })
  addressLine2?: string;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: number;

  @Field()
  orderNumber: string;

  @Field(() => Int)
  memberId: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod?: PaymentMethod;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  deliveryFee: number;

  @Field(() => Float)
  total: number;

  @Field()
  currency: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => OrderAddressInfo)
  address: OrderAddressInfo;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class OrdersResponse {
  @Field(() => [OrderType])
  list: OrderType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
