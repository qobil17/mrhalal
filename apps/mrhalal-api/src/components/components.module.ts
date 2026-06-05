import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [AuthModule, MemberModule, CategoryModule],
  exports: [AuthModule, MemberModule, CategoryModule],
})
export class ComponentsModule {}
