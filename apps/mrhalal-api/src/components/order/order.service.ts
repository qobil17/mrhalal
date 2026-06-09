import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { OrderStatus, PaymentMethod } from '@libs/types';
import { CreateOrderInput } from './dto/create-order.input';
import { OrdersInquiry } from './dto/orders-inquiry.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { OrderType, OrdersResponse } from './dto/order.type';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly DELIVERY_FEE = 3000;

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // HELPERS
  // ============================================

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const count = await this.prisma.order.count({
      where: { createdAt: { gte: startOfYear, lt: endOfYear } },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `HM-${year}-${sequence}`;
  }

  private transformOrder(order: any): OrderType {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      memberId: order.memberId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      currency: order.currency,
      notes: order.notes,
      address: {
        recipientName: order.recipientName,
        phone: order.phone,
        postalCode: order.postalCode,
        city: order.city,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
      },
      items: (order.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  async createOrder(memberId: number, input: CreateOrderInput): Promise<OrderType> {
    // 1. Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { memberId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException(
        "Savatcha bo'sh. Avval mahsulot qo'shing.",
      );
    }

    // 2. Resolve address: explicit or default
    let address: any;
    if (input.addressId) {
      address = await this.prisma.address.findFirst({
        where: { id: input.addressId, memberId },
      });
      if (!address) throw new NotFoundException('Manzil topilmadi');
    } else {
      address = await this.prisma.address.findFirst({
        where: { memberId, isDefault: true },
      });
      if (!address) {
        throw new BadRequestException(
          "Default manzil yo'q. Iltimos avval manzil qo'shing yoki addressId tanlang.",
        );
      }
    }

    // 3. Calculate totals (snapshot current prices)
    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      const price = Number(item.product.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      return {
        productId: item.productId,
        productName: item.product.nameEn,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    const total = subtotal + this.DELIVERY_FEE;
    const orderNumber = await this.generateOrderNumber();

    // 4. Create order + clear cart in one transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          memberId,
          status: OrderStatus.PENDING,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          subtotal,
          deliveryFee: this.DELIVERY_FEE,
          total,
          currency: 'KRW',
          notes: input.notes,
          // Snapshot address at order time
          recipientName: address.recipientName,
          phone: address.phone,
          postalCode: address.postalCode,
          city: address.city,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          createdById: memberId,
          updatedById: memberId,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    this.logger.log(
      `Order created: ${orderNumber} by member ${memberId}, total: ${total} KRW`,
    );
    return this.transformOrder(order);
  }

  async getMyOrders(memberId: number, input: OrdersInquiry): Promise<OrdersResponse> {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;

    const where: any = { memberId };
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { list: list.map((o) => this.transformOrder(o)), total, page, limit };
  }

  async getMyOrderById(memberId: number, id: number): Promise<OrderType> {
    const order = await this.prisma.order.findFirst({
      where: { id, memberId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order topilmadi');
    return this.transformOrder(order);
  }

  async cancelMyOrder(memberId: number, id: number): Promise<OrderType> {
    const order = await this.prisma.order.findFirst({
      where: { id, memberId },
    });
    if (!order) throw new NotFoundException('Order topilmadi');

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException(
        "Faqat to'lov kutilayotgan orderlarni bekor qilish mumkin. " +
          'Iltimos admin bilan bog\'lang.',
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED, updatedById: memberId },
      include: { items: true },
    });

    this.logger.log(`Order ${order.orderNumber} cancelled by customer`);
    return this.transformOrder(updated);
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async getAllOrdersByAdmin(input: OrdersInquiry): Promise<OrdersResponse> {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { list: list.map((o) => this.transformOrder(o)), total, page, limit };
  }

  async getOrderByIdAdmin(id: number): Promise<OrderType> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order topilmadi');
    return this.transformOrder(order);
  }

  async updateOrderStatusByAdmin(
    input: UpdateOrderStatusInput,
    adminId: number,
  ): Promise<OrderType> {
    const { id, status: newStatus } = input;

    const order = await this.prisma.order.findFirst({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order topilmadi');

    if (order.status === newStatus) {
      throw new BadRequestException('Status allaqachon shu holatda');
    }

    const oldStatus = order.status;

    // PENDING → PAID: decrease stock
    if (newStatus === OrderStatus.PAID && oldStatus === OrderStatus.PENDING) {
      for (const item of order.items) {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId },
        });
        if (!product || product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Mahsulot tugagan: ${item.productName}. Pulni qaytaring va orderni bekor qiling.`,
          );
        }
      }
      for (const item of order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }
      this.logger.log(`Stock decremented for order ${order.orderNumber}`);
    }

    // PAID/SHIPPED/DELIVERED → CANCELLED: restore stock
    const stockReducedStatuses = [
      OrderStatus.PAID,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    if (
      newStatus === OrderStatus.CANCELLED &&
      stockReducedStatuses.includes(oldStatus as any)
    ) {
      for (const item of order.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
      }
      this.logger.warn(`Stock restored for cancelled order ${order.orderNumber}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus, updatedById: adminId },
      include: { items: true },
    });

    this.logger.log(
      `Order ${order.orderNumber}: ${oldStatus} → ${newStatus} by admin ${adminId}`,
    );
    return this.transformOrder(updated);
  }
}
