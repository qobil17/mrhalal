import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';
import { Member, MemberRole } from '@libs/types';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductsInquiry } from './dto/products-inquiry.input';
import { Product, ProductsResponse } from './dto/product.type';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // PUBLIC

  @Query(() => ProductsResponse)
  async getAllProducts(
    @Args('input') input: ProductsInquiry,
  ): Promise<ProductsResponse> {
    return this.productService.getAllProducts(input);
  }

  @Query(() => Product)
  async getProductBySlug(@Args('slug') slug: string): Promise<Product> {
    return this.productService.getProductBySlug(slug);
  }

  @Query(() => ProductsResponse)
  async getProductsByCategory(
    @Args('categorySlug') categorySlug: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<ProductsResponse> {
    return this.productService.getProductsByCategory(categorySlug, page, limit);
  }

  @Query(() => [Product])
  async getFeaturedProducts(): Promise<Product[]> {
    return this.productService.getFeaturedProducts();
  }

  @Query(() => [Product])
  async getDiscountedProducts(): Promise<Product[]> {
    return this.productService.getDiscountedProducts();
  }

  // ADMIN

  @Query(() => ProductsResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getAllProductsByAdmin(
    @Args('input') input: ProductsInquiry,
  ): Promise<ProductsResponse> {
    return this.productService.getAllProductsByAdmin(input);
  }

  @Query(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getProductByIdAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Product> {
    return this.productService.getProductByIdAdmin(id);
  }

  @Query(() => [Product])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getExpiringProducts(): Promise<Product[]> {
    return this.productService.getExpiringProducts();
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async createProductByAdmin(
    @CurrentUser() member: Member,
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productService.createProduct(input, member.id);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateProductByAdmin(
    @CurrentUser() member: Member,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.updateProduct(input, member.id);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateStockByAdmin(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
    @Args('stockQuantity', { type: () => Int }) stockQuantity: number,
  ): Promise<Product> {
    return this.productService.updateStock(id, stockQuantity, member.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async deleteProductByAdmin(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.productService.deleteProduct(id, member.id);
  }
}
