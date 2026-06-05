import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [AuthModule, MemberModule, CategoryModule, ProductModule, CartModule],
  exports: [AuthModule, MemberModule, CategoryModule, ProductModule, CartModule],
})
export class ComponentsModule {}
