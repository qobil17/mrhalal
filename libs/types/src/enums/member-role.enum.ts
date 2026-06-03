import { registerEnumType } from '@nestjs/graphql';

export enum MemberRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

registerEnumType(MemberRole, {
  name: 'MemberRole',
  description: 'User role in the system',
});
