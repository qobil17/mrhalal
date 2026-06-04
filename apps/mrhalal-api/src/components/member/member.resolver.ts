import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Member, MemberRole } from '@libs/types';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@libs/common';
import { MemberService } from './member.service';
import { MemberUpdateInput } from './dto/member-update.input';
import { MemberByAdminUpdate } from './dto/member-by-admin.update';
import { MembersInquiry } from './dto/members-inquiry.input';
import { MembersResponse } from './dto/members.response';

@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  // ============================================
  // CUSTOMER QUERIES & MUTATIONS
  // ============================================

  @Query(() => Member)
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() member: Member): Promise<Member> {
    return this.memberService.getMyProfile(member.id);
  }

  @Mutation(() => Member)
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @CurrentUser() member: Member,
    @Args('input') input: MemberUpdateInput,
  ): Promise<Member> {
    return this.memberService.updateMyProfile(member.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMyAccount(@CurrentUser() member: Member): Promise<boolean> {
    return this.memberService.deleteMyAccount(member.id);
  }

  // ============================================
  // ADMIN QUERIES & MUTATIONS
  // ============================================

  @Query(() => Member)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getMemberByAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Member> {
    return this.memberService.getMemberByAdmin(id);
  }

  @Query(() => MembersResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getAllMembersByAdmin(
    @Args('input') input: MembersInquiry,
  ): Promise<MembersResponse> {
    return this.memberService.getAllMembersByAdmin(input);
  }

  @Mutation(() => Member)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateMemberByAdmin(
    @Args('input') input: MemberByAdminUpdate,
  ): Promise<Member> {
    return this.memberService.updateMemberByAdmin(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async deleteMemberByAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.memberService.deleteMemberByAdmin(id);
  }
}
