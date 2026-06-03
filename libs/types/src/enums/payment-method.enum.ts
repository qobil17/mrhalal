import { registerEnumType } from '@nestjs/graphql';

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  KAKAO_PAY = 'KAKAO_PAY',
  CASH = 'CASH',
}

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
