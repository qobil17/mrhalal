import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { OrderStatus } from '@libs/types';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { ReviewsInquiry } from './dto/reviews-inquiry.input';
import { ReviewType, ReviewsResponse } from './dto/review.type';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // HELPER: Recalculate product rating
  // ============================================
  private async recalculateProductRating(productId: number): Promise<void> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100,
        reviewCount,
      },
    });

    this.logger.log(
      `Product ${productId} rating: ${averageRating.toFixed(2)} (${reviewCount} reviews)`,
    );
  }

  // ============================================
  // HELPER: Verify purchase (must have DELIVERED order with this product)
  // ============================================
  private async verifyPurchase(memberId: number, productId: number): Promise<void> {
    const deliveredOrder = await this.prisma.order.findFirst({
      where: {
        memberId,
        status: OrderStatus.DELIVERED as any,
        items: { some: { productId } },
      },
    });

    if (!deliveredOrder) {
      throw new ForbiddenException(
        'Faqat sotib olgan va qabul qilingan mahsulot uchun review qoldira olasiz',
      );
    }
  }

  // ============================================
  // HELPER: Transform for GraphQL
  // ============================================
  private transformReview(review: any): ReviewType {
    return {
      id: review.id,
      productId: review.productId,
      memberId: review.memberId,
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      member: {
        id: review.member.id,
        firstName: review.member.firstName,
        avatar: review.member.avatar,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  async getProductReviews(
    productId: number,
    input: ReviewsInquiry,
  ): Promise<ReviewsResponse> {
    const { page, limit, rating } = input;
    const skip = (page - 1) * limit;

    const where: any = { productId };
    if (rating) where.rating = rating;

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          member: { select: { id: true, firstName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { list: list.map((r) => this.transformReview(r)), total, page, limit };
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  async createReview(memberId: number, input: CreateReviewInput): Promise<ReviewType> {
    const { productId, rating, comment } = input;

    // 1. Verify product exists
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    // 2. Verify purchase (must have DELIVERED order containing this product)
    await this.verifyPurchase(memberId, productId);

    // 3. Check for duplicate review
    const existing = await this.prisma.review.findFirst({
      where: { productId, memberId },
    });
    if (existing) {
      throw new BadRequestException(
        'Bu mahsulot uchun avval review qoldirgansiz. Yangilash uchun updateMyReview ishlatamiz.',
      );
    }

    // 4. Create review (isApproved=true since purchase is verified)
    const review = await this.prisma.review.create({
      data: {
        productId,
        memberId,
        rating,
        comment,
        isApproved: true,
      },
      include: {
        member: { select: { id: true, firstName: true, avatar: true } },
      },
    });

    // 5. Recalculate product rating
    await this.recalculateProductRating(productId);

    this.logger.log(
      `Review created by member ${memberId} for product ${productId}: ${rating} stars`,
    );

    return this.transformReview(review);
  }

  async updateMyReview(memberId: number, input: UpdateReviewInput): Promise<ReviewType> {
    const { id, ...data } = input;

    const review = await this.prisma.review.findFirst({
      where: { id, memberId },
    });
    if (!review) throw new NotFoundException('Review topilmadi');

    const updated = await this.prisma.review.update({
      where: { id },
      data,
      include: {
        member: { select: { id: true, firstName: true, avatar: true } },
      },
    });

    if (data.rating !== undefined && data.rating !== review.rating) {
      await this.recalculateProductRating(review.productId);
    }

    this.logger.log(`Review ${id} updated by member ${memberId}`);
    return this.transformReview(updated);
  }

  async deleteMyReview(memberId: number, id: number): Promise<boolean> {
    const review = await this.prisma.review.findFirst({
      where: { id, memberId },
    });
    if (!review) throw new NotFoundException('Review topilmadi');

    await this.prisma.review.delete({ where: { id } });
    await this.recalculateProductRating(review.productId);

    this.logger.log(`Review ${id} deleted by member ${memberId}`);
    return true;
  }

  async getMyReviews(memberId: number, input: ReviewsInquiry): Promise<ReviewsResponse> {
    const { page, limit, rating } = input;
    const skip = (page - 1) * limit;

    const where: any = { memberId };
    if (rating) where.rating = rating;

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          member: { select: { id: true, firstName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { list: list.map((r) => this.transformReview(r)), total, page, limit };
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async deleteReviewByAdmin(id: number): Promise<boolean> {
    const review = await this.prisma.review.findFirst({ where: { id } });
    if (!review) throw new NotFoundException('Review topilmadi');

    await this.prisma.review.delete({ where: { id } });
    await this.recalculateProductRating(review.productId);

    this.logger.warn(`Review ${id} deleted by ADMIN (moderation)`);
    return true;
  }
}
