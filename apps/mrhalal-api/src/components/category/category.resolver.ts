import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@libs/common';
import { MemberRole } from '@libs/types';
import { CategoryService } from './category.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CategoriesInquiry } from './dto/categories-inquiry.input';
import { Category, CategoriesResponse } from './dto/category.type';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  // ============================================
  // PUBLIC QUERIES
  // ============================================

  @Query(() => [Category])
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  @Query(() => Category)
  async getCategoryBySlug(@Args('slug') slug: string): Promise<Category> {
    return this.categoryService.getCategoryBySlug(slug);
  }

  // ============================================
  // ADMIN QUERIES
  // ============================================

  @Query(() => CategoriesResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getAllCategoriesByAdmin(
    @Args('input') input: CategoriesInquiry,
  ): Promise<CategoriesResponse> {
    return this.categoryService.getAllCategoriesByAdmin(input);
  }

  @Query(() => Category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async getCategoryByIdAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    return this.categoryService.getCategoryByIdAdmin(id);
  }

  // ============================================
  // ADMIN MUTATIONS
  // ============================================

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async createCategoryByAdmin(
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.createCategory(input);
  }

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async updateCategoryByAdmin(
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.updateCategory(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async deleteCategoryByAdmin(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.categoryService.deleteCategory(id);
  }
}
