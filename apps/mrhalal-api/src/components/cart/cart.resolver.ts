import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';
import { Member, MemberRole } from '@libs/types';
import { CartService } from './cart.service';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { CartType } from './dto/cart.type';

@Resolver(() => CartType)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  // ============================================
  // CUSTOMER OPERATIONS (require login)
  // ============================================

  @Query(() => CartType)
  @UseGuards(JwtAuthGuard)
  async getMyCart(@CurrentUser() member: Member): Promise<CartType> {
    return this.cartService.getMyCart(member.id);
  }

  @Mutation(() => CartType)
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @CurrentUser() member: Member,
    @Args('input') input: AddToCartInput,
  ): Promise<CartType> {
    return this.cartService.addToCart(member.id, input);
  }

  @Mutation(() => CartType)
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @CurrentUser() member: Member,
    @Args('input') input: UpdateCartItemInput,
  ): Promise<CartType> {
    return this.cartService.updateCartItem(member.id, input);
  }

  @Mutation(() => CartType)
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @CurrentUser() member: Member,
    @Args('itemId', { type: () => Int }) itemId: number,
  ): Promise<CartType> {
    return this.cartService.removeFromCart(member.id, itemId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() member: Member): Promise<boolean> {
    return this.cartService.clearCart(member.id);
  }

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  @Query(() => CartType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getCartByMemberIdAdmin(
    @Args('memberId', { type: () => Int }) memberId: number,
  ): Promise<CartType> {
    return this.cartService.getCartByMemberIdAdmin(memberId);
  }
}
