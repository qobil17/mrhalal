import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';
import { Member, MemberRole } from '@libs/types';
import { ReviewService } from './review.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { ReviewsInquiry } from './dto/reviews-inquiry.input';
import { ReviewType, ReviewsResponse } from './dto/review.type';

@Resolver(() => ReviewType)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  // PUBLIC

  @Query(() => ReviewsResponse)
  async getProductReviews(
    @Args('productId', { type: () => Int }) productId: number,
    @Args('input') input: ReviewsInquiry,
  ): Promise<ReviewsResponse> {
    return this.reviewService.getProductReviews(productId, input);
  }

  // CUSTOMER

  @Mutation(() => ReviewType)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @CurrentUser() member: Member,
    @Args('input') input: CreateReviewInput,
  ): Promise<ReviewType> {
    return this.reviewService.createReview(member.id, input);
  }

  @Mutation(() => ReviewType)
  @UseGuards(JwtAuthGuard)
  async updateMyReview(
    @CurrentUser() member: Member,
    @Args('input') input: UpdateReviewInput,
  ): Promise<ReviewType> {
    return this.reviewService.updateMyReview(member.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMyReview(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.reviewService.deleteMyReview(member.id, id);
  }

  @Query(() => ReviewsResponse)
  @UseGuards(JwtAuthGuard)
  async getMyReviews(
    @CurrentUser() member: Member,
    @Args('input') input: ReviewsInquiry,
  ): Promise<ReviewsResponse> {
    return this.reviewService.getMyReviews(member.id, input);
  }

  // ADMIN

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async deleteReviewByAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.reviewService.deleteReviewByAdmin(id);
  }
}
