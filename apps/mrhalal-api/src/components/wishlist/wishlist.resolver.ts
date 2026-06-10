import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@libs/common';
import { Member } from '@libs/types';
import { WishlistService } from './wishlist.service';
import { WishlistResponse } from './dto/wishlist.type';

@Resolver(() => WishlistResponse)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @Query(() => WishlistResponse)
  @UseGuards(JwtAuthGuard)
  async getMyWishlist(@CurrentUser() member: Member): Promise<WishlistResponse> {
    return this.wishlistService.getMyWishlist(member.id);
  }

  @Mutation(() => WishlistResponse)
  @UseGuards(JwtAuthGuard)
  async addToWishlist(
    @CurrentUser() member: Member,
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<WishlistResponse> {
    return this.wishlistService.addToWishlist(member.id, productId);
  }

  @Mutation(() => WishlistResponse)
  @UseGuards(JwtAuthGuard)
  async removeFromWishlist(
    @CurrentUser() member: Member,
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<WishlistResponse> {
    return this.wishlistService.removeFromWishlist(member.id, productId);
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async isInWishlist(
    @CurrentUser() member: Member,
    @Args('productId', { type: () => Int }) productId: number,
  ): Promise<boolean> {
    return this.wishlistService.isInWishlist(member.id, productId);
  }
}
