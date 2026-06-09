import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';
import { Member, MemberRole } from '@libs/types';
import { OrderService } from './order.service';
import { CreateOrderInput } from './dto/create-order.input';
import { OrdersInquiry } from './dto/orders-inquiry.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { OrderType, OrdersResponse } from './dto/order.type';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  // CUSTOMER

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() member: Member,
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderType> {
    return this.orderService.createOrder(member.id, input);
  }

  @Query(() => OrdersResponse)
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @CurrentUser() member: Member,
    @Args('input') input: OrdersInquiry,
  ): Promise<OrdersResponse> {
    return this.orderService.getMyOrders(member.id, input);
  }

  @Query(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async getMyOrderById(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<OrderType> {
    return this.orderService.getMyOrderById(member.id, id);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async cancelMyOrder(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<OrderType> {
    return this.orderService.cancelMyOrder(member.id, id);
  }

  // ADMIN

  @Query(() => OrdersResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getAllOrdersByAdmin(
    @Args('input') input: OrdersInquiry,
  ): Promise<OrdersResponse> {
    return this.orderService.getAllOrdersByAdmin(input);
  }

  @Query(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getOrderByIdAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<OrderType> {
    return this.orderService.getOrderByIdAdmin(id);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateOrderStatusByAdmin(
    @CurrentUser() admin: Member,
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<OrderType> {
    return this.orderService.updateOrderStatusByAdmin(input, admin.id);
  }
}
