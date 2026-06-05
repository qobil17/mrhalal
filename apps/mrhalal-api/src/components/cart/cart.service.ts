import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { CartType } from './dto/cart.type';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // HELPER: Get or create cart for member
  // ============================================
  private async getOrCreateCart(memberId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { memberId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { memberId },
      });
      this.logger.log(`Cart created for member ${memberId}`);
    }

    return cart;
  }

  // ============================================
  // HELPER: Fetch cart with items, products, and computed totals
  // ============================================
  private async fetchFullCart(cartId: number): Promise<CartType> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const items = cart.items.map((item) => {
      const price = Number(item.product.price);
      const subtotal = price * item.quantity;

      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          ...item.product,
          price,
          comparePrice: item.product.comparePrice
            ? Number(item.product.comparePrice)
            : null,
          weight: item.product.weight ? Number(item.product.weight) : null,
          averageRating: Number(item.product.averageRating),
        },
        subtotal,
        createdAt: item.createdAt,
      };
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      memberId: cart.memberId,
      items: items as any,
      total,
      itemCount: items.length,
      currency: 'KRW',
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  async getMyCart(memberId: number): Promise<CartType> {
    const cart = await this.getOrCreateCart(memberId);
    return this.fetchFullCart(cart.id);
  }

  async addToCart(memberId: number, input: AddToCartInput): Promise<CartType> {
    const { productId, quantity } = input;

    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    const cart = await this.getOrCreateCart(memberId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    // Hidden stock validation — no stock numbers revealed to customer
    if (newQuantity > product.stockQuantity) {
      throw new BadRequestException(
        'Bu miqdor hozir mavjud emas. Iltimos kichikroq miqdor tanlang.',
      );
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
      this.logger.log(
        `Cart item updated: member ${memberId}, product ${productId}, qty ${newQuantity}`,
      );
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
      this.logger.log(
        `Cart item added: member ${memberId}, product ${productId}, qty ${quantity}`,
      );
    }

    return this.fetchFullCart(cart.id);
  }

  async updateCartItem(
    memberId: number,
    input: UpdateCartItemInput,
  ): Promise<CartType> {
    const { itemId, quantity } = input;

    const cart = await this.getOrCreateCart(memberId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Savatdagi mahsulot topilmadi');
    }

    // Hidden stock validation
    if (quantity > item.product.stockQuantity) {
      throw new BadRequestException(
        'Bu miqdor hozir mavjud emas. Iltimos kichikroq miqdor tanlang.',
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    this.logger.log(
      `Cart item ${itemId} quantity set to ${quantity} for member ${memberId}`,
    );

    return this.fetchFullCart(cart.id);
  }

  async removeFromCart(memberId: number, itemId: number): Promise<CartType> {
    const cart = await this.getOrCreateCart(memberId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Savatdagi mahsulot topilmadi');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    this.logger.log(`Cart item ${itemId} removed for member ${memberId}`);

    return this.fetchFullCart(cart.id);
  }

  async clearCart(memberId: number): Promise<boolean> {
    const cart = await this.getOrCreateCart(memberId);

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    this.logger.log(`Cart cleared for member ${memberId}`);
    return true;
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getCartByMemberIdAdmin(memberId: number): Promise<CartType> {
    const cart = await this.prisma.cart.findUnique({
      where: { memberId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for this member');
    }

    return this.fetchFullCart(cart.id);
  }
}
