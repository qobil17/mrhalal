import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@libs/common';
import { Member } from '@libs/types';
import { AddressService } from './address.service';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { Address } from './dto/address.type';

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Query(() => [Address])
  @UseGuards(JwtAuthGuard)
  async getMyAddresses(@CurrentUser() member: Member): Promise<Address[]> {
    return this.addressService.getMyAddresses(member.id);
  }

  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  async createAddress(
    @CurrentUser() member: Member,
    @Args('input') input: CreateAddressInput,
  ): Promise<Address> {
    return this.addressService.createAddress(member.id, input);
  }

  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @CurrentUser() member: Member,
    @Args('input') input: UpdateAddressInput,
  ): Promise<Address> {
    return this.addressService.updateAddress(member.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteAddress(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.addressService.deleteAddress(member.id, id);
  }

  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  async setDefaultAddress(
    @CurrentUser() member: Member,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Address> {
    return this.addressService.setDefaultAddress(member.id, id);
  }
}
