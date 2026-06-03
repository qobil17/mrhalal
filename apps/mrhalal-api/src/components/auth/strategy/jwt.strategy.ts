import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@libs/prisma';

export interface JwtPayload {
  sub: number;
  phone: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!member) {
      throw new UnauthorizedException('Member not found or inactive');
    }

    const { password, ...result } = member;
    return result;
  }
}
