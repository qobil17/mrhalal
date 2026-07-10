import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { ProductLabel } from '@libs/types';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductsInquiry } from './dto/products-inquiry.input';
import { Product, ProductsResponse } from './dto/product.type';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // PUBLIC METHODS
  // ============================================

  async getAllProducts(input: ProductsInquiry): Promise<ProductsResponse> {
    const { page, limit, search, categoryId, minPrice, maxPrice, isFeatured } = input;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
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
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list: list.map(this.transformProduct) as any,
      total,
      page,
      limit,
    };
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product) throw new NotFoundException(`Product "${slug}" not found`);

    // Increment view count (fire and forget)
    this.prisma.product
      .update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return this.transformProduct(product) as any;
  }

  async getProductsByCategory(
    categorySlug: string,
    page = 1,
    limit = 20,
  ): Promise<ProductsResponse> {
    const category = await this.prisma.category.findFirst({
      where: { slug: categorySlug, isActive: true, deletedAt: null },
    });

    if (!category)
      throw new NotFoundException(`Category "${categorySlug}" not found`);

    return this.getAllProducts({
      page,
      limit,
      categoryId: category.id,
    } as ProductsInquiry);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const list = await this.prisma.product.findMany({
      where: { label: ProductLabel.RECOMMENDED, isActive: true, deletedAt: null },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return list.map(this.transformProduct) as any;
  }

  async getDiscountedProducts(): Promise<Product[]> {
    const list = await this.prisma.product.findMany({
      where: { label: ProductLabel.DISCOUNT, isActive: true, deletedAt: null },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return list.map(this.transformProduct) as any;
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getAllProductsByAdmin(input: ProductsInquiry): Promise<ProductsResponse> {
    const { page, limit, search, categoryId, minPrice, maxPrice, isFeatured, isActive } = input;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isActive !== undefined) where.isActive = isActive;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
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
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list: list.map(this.transformProduct) as any,
      total,
      page,
      limit,
    };
  }

  async getProductByIdAdmin(id: number): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product) throw new NotFoundException('Product not found');
    return this.transformProduct(product) as any;
  }

  async createProduct(input: CreateProductInput, memberId: number): Promise<Product> {
    const category = await this.prisma.category.findFirst({
      where: { id: input.categoryId, deletedAt: null },
    });
    if (!category) throw new BadRequestException('Category not found');

    const slug = this.generateSlug(input.nameEn);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Product with slug "${slug}" already exists`);
    }

    const { images, ...productData } = input;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        slug,
        createdById: memberId,
        updatedById: memberId,
        images:
          images && images.length > 0
            ? {
                create: images.map((img, idx) => ({
                  url: img.url,
                  alt: img.alt,
                  sortOrder: img.sortOrder ?? idx,
                  isPrimary: img.isPrimary ?? idx === 0,
                })),
              }
            : undefined,
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    this.logger.log(`Product created: ${product.slug} by member ${memberId}`);
    return this.transformProduct(product) as any;
  }

  async updateProduct(input: UpdateProductInput, memberId: number): Promise<Product> {
    const { id, images, ...data } = input;

    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: data.categoryId, deletedAt: null },
      });
      if (!category) throw new BadRequestException('New category not found');
    }

    const updateData: any = { ...data, updatedById: memberId };

    if (data.nameEn && data.nameEn !== product.nameEn) {
      const newSlug = this.generateSlug(data.nameEn);
      const slugExists = await this.prisma.product.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (slugExists) {
        throw new BadRequestException(`Slug "${newSlug}" already exists`);
      }
      updateData.slug = newSlug;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // images kelsa — eskisini o'chir, yangisini yoz; kelmasa — tegma
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...updateData,
          ...(images !== undefined && images.length > 0
            ? {
                images: {
                  create: images.map((img, idx) => ({
                    url: img.url,
                    alt: img.alt,
                    sortOrder: img.sortOrder ?? idx,
                    isPrimary: img.isPrimary ?? idx === 0,
                  })),
                },
              }
            : {}),
        },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    this.logger.log(`Product updated: ${updated.slug}`);
    return this.transformProduct(updated) as any;
  }

  async updateStock(id: number, stockQuantity: number, memberId: number): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { stockQuantity, updatedById: memberId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    this.logger.log(`Stock updated for ${updated.slug}: ${stockQuantity}`);
    return this.transformProduct(updated) as any;
  }

  async deleteProduct(id: number, memberId: number): Promise<boolean> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Rename slug to free it for reuse (e.g., "tomato" -> "tomato_deleted_1717589234567")
    const archivedSlug = `${product.slug}_deleted_${Date.now()}`;

    await this.prisma.product.update({
      where: { id },
      data: {
        slug: archivedSlug,
        deletedAt: new Date(),
        isActive: false,
        updatedById: memberId,
      },
    });

    this.logger.warn(`Product soft-deleted: ${product.slug} → ${archivedSlug}`);
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

  private transformProduct(product: any): any {
    return {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      averageRating: Number(product.averageRating),
    };
  }
}
