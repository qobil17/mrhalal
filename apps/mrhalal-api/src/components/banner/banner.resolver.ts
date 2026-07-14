import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@libs/common';
import { MemberRole } from '@libs/types';
import { BannerService } from './banner.service';
import { CreateBannerInput } from './dto/create-banner.input';
import { UpdateBannerInput } from './dto/update-banner.input';
import { BannersInquiry } from './dto/banners-inquiry.input';
import { Banner, BannersResponse } from './dto/banner.type';

@Resolver(() => Banner)
export class BannerResolver {
  constructor(private readonly bannerService: BannerService) {}

  // ============================================
  // PUBLIC
  // ============================================

  @Query(() => [Banner])
  async getAllBanners(): Promise<Banner[]> {
    return this.bannerService.getAllBanners();
  }

  // ============================================
  // ADMIN
  // ============================================

  @Query(() => BannersResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getAllBannersByAdmin(
    @Args('input') input: BannersInquiry,
  ): Promise<BannersResponse> {
    return this.bannerService.getAllBannersByAdmin(input);
  }

  @Query(() => Banner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getBannerByIdAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Banner> {
    return this.bannerService.getBannerByIdAdmin(id);
  }

  @Mutation(() => Banner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async createBannerByAdmin(
    @Args('input') input: CreateBannerInput,
  ): Promise<Banner> {
    return this.bannerService.createBanner(input);
  }

  @Mutation(() => Banner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateBannerByAdmin(
    @Args('input') input: UpdateBannerInput,
  ): Promise<Banner> {
    return this.bannerService.updateBanner(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async deleteBannerByAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.bannerService.deleteBanner(id);
  }
}
