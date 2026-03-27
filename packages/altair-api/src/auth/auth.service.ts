import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, IdentityProvider } from '@altairgraphql/db';
import { PrismaService } from 'nestjs-prisma';
import { Config } from 'src/common/config';
import { ChangePasswordInput } from './models/change-password.input';
import { PasswordService } from './password/password.service';
import { IToken } from '@altairgraphql/api-utils';
import { getAgent } from 'src/newrelic/newrelic';

const NEW_USER_TIME = 1000 * 60 * 10; // 10 minutes
@Injectable()
export class AuthService {
  private readonly agent = getAgent();
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService<Config>
  ) {}

  async passwordLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password ?? ''
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.getLoginResponse(user);
  }

  googleLogin(user?: User) {
    if (!user) {
      throw new BadRequestException('No user from google');
    }

    return this.getLoginResponse(user);
  }

  githubLogin(user?: User) {
    if (!user) {
      throw new BadRequestException('No user from github');
    }

    return this.getLoginResponse(user);
  }

  getUserProfile(user?: User) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };
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
    try {
      const decoded = this.jwtService.verify(token);
      const id = decoded?.['userId'];
      if (!id) {
        throw new UnauthorizedException('Invalid JWT token');
      }
      return this.prisma.user.findUnique({ where: { id } });
    } catch {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
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
    this.agent?.incrementMetric('auth.login.success');

    return {
      ...this.getUserProfile(user),
      isNewUser: Date.now() - user.createdAt.getTime() < NEW_USER_TIME,
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
    const securityConfig = this.configService.get('security', { infer: true });
    this.agent?.incrementMetric('auth.events_token.generate');
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get('EVENTS_JWT_ACCESS_SECRET', {
          infer: true,
        }),
        expiresIn: securityConfig?.shortExpiresIn,
      }
    );
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get('security', { infer: true });
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: securityConfig?.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Generate a short-lived JWT for email verification (24h expiry).
   */
  generateEmailVerificationToken(userId: string): string {
    return this.jwtService.sign(
      { userId, purpose: 'email-verification' },
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify an email verification token and mark the user's email as verified.
   */
  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload?.purpose !== 'email-verification' || !payload?.userId) {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      if (user.emailVerified) {
        return { verified: true };
      }

      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { emailVerified: new Date() },
      });

      this.agent?.incrementMetric('auth.email_verified');
      return { verified: true };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
}
