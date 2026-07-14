import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { CreateBannerInput } from './dto/create-banner.input';
import { UpdateBannerInput } from './dto/update-banner.input';
import { BannersInquiry } from './dto/banners-inquiry.input';
import { Banner, BannersResponse } from './dto/banner.type';

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // PUBLIC METHODS (no auth)
  // ============================================

  async getAllBanners(): Promise<Banner[]> {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getAllBannersByAdmin(input: BannersInquiry): Promise<BannersResponse> {
    const { page, limit, isActive } = input;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [list, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.banner.count({ where }),
    ]);

    return { list, total, page, limit };
  }

  async getBannerByIdAdmin(id: number): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async createBanner(input: CreateBannerInput): Promise<Banner> {
    const banner = await this.prisma.banner.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });

    this.logger.log(`Banner created: ${banner.title}`);
    return banner;
  }

  async updateBanner(input: UpdateBannerInput): Promise<Banner> {
    const { id, ...data } = input;

    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    const updated = await this.prisma.banner.update({ where: { id }, data });

    this.logger.log(`Banner updated: ${updated.title}`);
    return updated;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });

    this.logger.warn(`Banner deleted: ${banner.title} (id=${id})`);
    return true;
  }
}
