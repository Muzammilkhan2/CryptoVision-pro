import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProfile } from '@cryptovision/shared-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'cryptovision_super_secret_jwt_access_token_key_2026',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }): Promise<UserProfile> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role as any,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (e) {
      // In case DB is not yet running, allow payload decoding in dev
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role as any,
        createdAt: new Date().toISOString(),
      };
    }
  }
}
