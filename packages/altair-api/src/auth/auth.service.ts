import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, IdentityProvider } from '@altairgraphql/db';
import { PrismaService } from 'nestjs-prisma';
import { SecurityConfig } from 'src/common/config';
import { ChangePasswordInput } from './models/change-password.input';
import { PasswordService } from './password/password.service';
import { IToken } from '@altairgraphql/api-utils';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {}

  async passwordLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password ?? ''
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.getLoginResponse(user);
  }

  googleLogin(user: User) {
    if (!user) {
      throw new BadRequestException('No user from google');
    }

    return this.getLoginResponse(user);
  }

  getUserCredential(providerUserId: string, provider: IdentityProvider) {
    return this.prisma.userCredential.findFirst({
      where: {
        providerUserId,
        provider,
      },
    });
  }

  validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  getUserFromToken(token: string): Promise<User | null> {
    const decoded = this.jwtService.decode(token);
    if (typeof decoded === 'string') {
      throw new Error('Invalid JWT token');
    }

    const id = decoded?.['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordInput
  ) {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword
    );

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }

  getLoginResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      tokens: this.generateTokens({ userId: user.id }),
    };
  }

  generateTokens(payload: { userId: string }): IToken {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Generates a short-lived events token for the purpose of event connection
   */
  getShortLivedEventsToken(userId: string): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('EVENTS_JWT_ACCESS_SECRET'),
        expiresIn: securityConfig?.shortExpiresIn,
      }
    );
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig?.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
