import { registerEnumType } from '@nestjs/graphql';

export enum ProductLabel {
  RECOMMENDED = 'RECOMMENDED',
  DISCOUNT = 'DISCOUNT',
}

registerEnumType(ProductLabel, {
  name: 'ProductLabel',
  description: 'Product display label: recommended or discount',
});
