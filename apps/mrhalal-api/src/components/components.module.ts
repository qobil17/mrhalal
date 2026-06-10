import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [AuthModule, MemberModule, CategoryModule, ProductModule, CartModule, AddressModule, OrderModule, ReviewModule, WishlistModule],
  exports: [AuthModule, MemberModule, CategoryModule, ProductModule, CartModule, AddressModule, OrderModule, ReviewModule, WishlistModule],
})
export class ComponentsModule {}
