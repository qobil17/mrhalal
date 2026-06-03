import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@libs/prisma';
import { MemberRole } from '@libs/types';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth-payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email }] : []),
        ],
        deletedAt: null,
      },
    });

    if (existingMember) {
      throw new BadRequestException('Phone or email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    const member = await this.prisma.member.create({
      data: {
        phone: input.phone,
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: MemberRole.CUSTOMER,
        cart: {
          create: {},
        },
      },
    });

    this.logger.log(`New member registered: ${member.phone}`);

    const accessToken = this.generateToken(member.id, member.phone, member.role);
    const { password, ...memberWithoutPassword } = member;

    return {
      accessToken,
      member: memberWithoutPassword as any,
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const member = await this.prisma.member.findFirst({
      where: {
        phone: input.phone,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!member) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, member.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    this.logger.log(`Member logged in: ${member.phone}`);

    const accessToken = this.generateToken(member.id, member.phone, member.role);
    const { password, ...memberWithoutPassword } = member;

    return {
      accessToken,
      member: memberWithoutPassword as any,
    };
  }

  private generateToken(id: number, phone: string, role: string): string {
    const payload = { sub: id, phone, role };
    return this.jwtService.sign(payload);
  }
}
