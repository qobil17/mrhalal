import { registerEnumType } from '@nestjs/graphql';

export enum Unit {
  G = 'G',
  KG = 'KG',
  L = 'L',
  ML = 'ML',
  PIECE = 'PIECE',
}

registerEnumType(Unit, {
  name: 'Unit',
  description: 'Product measurement units',
});
