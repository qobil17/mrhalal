import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field(() => ID)
  id: number;

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

  @Field()
  isDefault: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
