import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { WishlistResponse } from './dto/wishlist.type';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  private transformProduct(product: any): any {
    return {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      averageRating: Number(product.averageRating),
    };
  }

  async getMyWishlist(memberId: number): Promise<WishlistResponse> {
    const items = await this.prisma.wishlist.findMany({
      where: { memberId },
      include: {
        product: {
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const validItems = items
      .filter((item) => item.product && !item.product.deletedAt)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        product: this.transformProduct(item.product),
        createdAt: item.createdAt,
      }));

    return { items: validItems as any, total: validItems.length };
  }

  async addToWishlist(memberId: number, productId: number): Promise<WishlistResponse> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const existing = await this.prisma.wishlist.findUnique({
      where: { memberId_productId: { memberId, productId } },
    });

    if (!existing) {
      await this.prisma.wishlist.create({ data: { memberId, productId } });
      this.logger.log(`Product ${productId} added to wishlist by member ${memberId}`);
    }

    return this.getMyWishlist(memberId);
  }

  async removeFromWishlist(memberId: number, productId: number): Promise<WishlistResponse> {
    const existing = await this.prisma.wishlist.findUnique({
      where: { memberId_productId: { memberId, productId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      this.logger.log(`Product ${productId} removed from wishlist by member ${memberId}`);
    }

    return this.getMyWishlist(memberId);
  }

  async isInWishlist(memberId: number, productId: number): Promise<boolean> {
    const existing = await this.prisma.wishlist.findUnique({
      where: { memberId_productId: { memberId, productId } },
    });
    return !!existing;
  }
}
