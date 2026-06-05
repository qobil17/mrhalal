import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CategoriesInquiry } from './dto/categories-inquiry.input';
import { Category, CategoriesResponse } from './dto/category.type';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // PUBLIC METHODS (no auth)
  // ============================================

  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    }) as any;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category as any;
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getAllCategoriesByAdmin(
    input: CategoriesInquiry,
  ): Promise<CategoriesResponse> {
    const { page, limit, search, isActive } = input;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { nameUz: { contains: search, mode: 'insensitive' } },
        { nameKo: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return { list: list as any, total, page, limit };
  }

  async getCategoryByIdAdmin(id: number): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category as any;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = this.generateSlug(input.nameEn);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException(
        `Category with slug "${slug}" already exists. Please use a different English name.`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        slug,
        nameUz: input.nameUz,
        nameKo: input.nameKo,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        image: input.image,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });

    this.logger.log(`Category created: ${category.slug}`);
    return category as any;
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...data } = input;

    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updateData: any = { ...data };

    if (data.nameEn && data.nameEn !== category.nameEn) {
      const newSlug = this.generateSlug(data.nameEn);
      const slugExists = await this.prisma.category.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });

      if (slugExists) {
        throw new BadRequestException(`Slug "${newSlug}" already exists`);
      }

      updateData.slug = newSlug;
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Category updated: ${updated.slug}`);
    return updated as any;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const archivedSlug = `${category.slug}_deleted_${Date.now()}`;

    await this.prisma.category.update({
      where: { id },
      data: {
        slug: archivedSlug,
        deletedAt: new Date(),
        isActive: false,
      },
    });

    this.logger.warn(`Category soft-deleted: ${category.slug} → ${archivedSlug}`);
    return true;
  }

  // ============================================
  // HELPERS
  // ============================================

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
