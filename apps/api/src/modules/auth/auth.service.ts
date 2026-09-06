import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponse, UserProfile, UserRole } from '@cryptovision/shared-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // In-memory fallback for local dev when PostgreSQL is offline
  private devUsers = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const role: UserRole = dto.role || 'USER';

    let user: any;
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existing) {
        throw new ConflictException('An account with this email already exists');
      }

      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          role: role as any,
        },
      });
    } catch (e: any) {
      if (e instanceof ConflictException) throw e;
      // Fallback in-memory registration
      if (this.devUsers.has(dto.email.toLowerCase())) {
        throw new ConflictException('An account with this email already exists');
      }
      user = {
        id: `usr_${Date.now()}`,
        email: dto.email.toLowerCase(),
        passwordHash,
        role,
        createdAt: new Date(),
      };
      this.devUsers.set(dto.email.toLowerCase(), user);
    }

    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    let user: any;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
    } catch (e) {
      user = this.devUsers.get(dto.email.toLowerCase());
    }

    if (!user) {
      user = this.devUsers.get(dto.email.toLowerCase());
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  async refresh(dto: RefreshDto): Promise<{ accessToken: string }> {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'cryptovision_super_secret_jwt_refresh_token_key_2026';

      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret:
            this.configService.get<string>('JWT_ACCESS_SECRET') ||
            'cryptovision_super_secret_jwt_access_token_key_2026',
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    } catch (e) {}

    return { message: 'Successfully logged out' };
  }

  private generateAuthResponse(user: any): AuthResponse {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'cryptovision_super_secret_jwt_access_token_key_2026';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'cryptovision_super_secret_jwt_refresh_token_key_2026';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '30d',
    });

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
    };

    return {
      user: userProfile,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
