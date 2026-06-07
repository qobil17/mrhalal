import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { Address } from './dto/address.type';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyAddresses(memberId: number): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { memberId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }) as any;
  }

  async createAddress(
    memberId: number,
    input: CreateAddressInput,
  ): Promise<Address> {
    // If this is marked as default, clear existing default first
    if (input.isDefault) {
      await this.prisma.address.updateMany({
        where: { memberId, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // First address is always default
      const count = await this.prisma.address.count({ where: { memberId } });
      if (count === 0) input.isDefault = true;
    }

    const address = await this.prisma.address.create({
      data: { memberId, ...input },
    });

    this.logger.log(`Address created for member ${memberId}: ${address.city}`);
    return address as any;
  }

  async updateAddress(
    memberId: number,
    input: UpdateAddressInput,
  ): Promise<Address> {
    const { id, ...data } = input;

    const address = await this.prisma.address.findFirst({
      where: { id, memberId },
    });
    if (!address) throw new NotFoundException('Manzil topilmadi');

    // Clear other defaults if this one is being set as default
    if (data.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { memberId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({ where: { id }, data });

    this.logger.log(`Address ${id} updated for member ${memberId}`);
    return updated as any;
  }

  async deleteAddress(memberId: number, id: number): Promise<boolean> {
    const address = await this.prisma.address.findFirst({
      where: { id, memberId },
    });
    if (!address) throw new NotFoundException('Manzil topilmadi');

    await this.prisma.address.delete({ where: { id } });

    // If deleted address was default, promote the most recent remaining address
    if (address.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { memberId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
        this.logger.log(`New default address promoted: ${next.id}`);
      }
    }

    this.logger.log(`Address ${id} deleted for member ${memberId}`);
    return true;
  }

  async setDefaultAddress(memberId: number, id: number): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id, memberId },
    });
    if (!address) throw new NotFoundException('Manzil topilmadi');

    await this.prisma.address.updateMany({
      where: { memberId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });

    const updated = await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    this.logger.log(`Default address set to ${id} for member ${memberId}`);
    return updated as any;
  }
}
