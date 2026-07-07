import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { Member, MemberRole } from '@libs/types';
import { MemberUpdateInput } from './dto/member-update.input';
import { MemberByAdminUpdate } from './dto/member-by-admin.update';
import { MembersInquiry } from './dto/members-inquiry.input';
import { MembersResponse } from './dto/members.response';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  async getMyProfile(memberId: number): Promise<Member> {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        deletedAt: null,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const { password, ...result } = member;
    return result as any;
  }

  async updateMyProfile(
    memberId: number,
    input: MemberUpdateInput,
  ): Promise<Member> {
    if (input.email) {
      const existing = await this.prisma.member.findFirst({
        where: {
          email: input.email,
          id: { not: memberId },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: input,
    });

    this.logger.log(`Member ${memberId} updated their profile`);

    const { password, ...result } = updated;
    return result as any;
  }

  async deleteMyAccount(memberId: number): Promise<boolean> {
    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    this.logger.warn(`Member ${memberId} deleted their account`);
    return true;
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getMemberByAdmin(memberId: number): Promise<Member> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const { password, ...result } = member;
    return result as any;
  }

  async getAllMembersByAdmin(input: MembersInquiry): Promise<MembersResponse> {
    const { page, limit, search, role } = input;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    const cleanList = list.map(({ password, ...rest }) => rest as any);

    return { list: cleanList, total, page, limit };
  }

  async updateMemberByAdmin(input: MemberByAdminUpdate, currentUserId: number): Promise<Member> {
    const { id, ...data } = input;

    const member = await this.prisma.member.findFirst({
      where: { id, deletedAt: null },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Rol o'zgartirilayotgan bo'lsa himoyalarni tekshir
    if (data.role !== undefined && data.role !== member.role) {
      if (id === currentUserId) {
        throw new ForbiddenException('O\'z akkauntingizning rolini o\'zgartira olmaysiz');
      }

      if (member.role === MemberRole.ADMIN && data.role === MemberRole.CUSTOMER) {
        const adminCount = await this.prisma.member.count({
          where: { role: MemberRole.ADMIN, deletedAt: null },
        });
        if (adminCount <= 1) {
          throw new BadRequestException('Kamida bitta admin qolishi kerak');
        }
      }
    }

    if (data.email) {
      const existing = await this.prisma.member.findFirst({
        where: {
          email: data.email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updated = await this.prisma.member.update({
      where: { id },
      data,
    });

    this.logger.log(`Admin updated member ${id}`);

    const { password, ...result } = updated;
    return result as any;
  }

  async deleteMemberByAdmin(memberId: number): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    this.logger.warn(`Admin deleted member ${memberId}`);
    return true;
  }
}
