import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AuthModule, MemberModule, CategoryModule, ProductModule],
  exports: [AuthModule, MemberModule, CategoryModule, ProductModule],
})
export class ComponentsModule {}
