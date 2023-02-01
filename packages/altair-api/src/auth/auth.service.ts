import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, IdentityProvider } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'nestjs-prisma';
import { SecurityConfig } from 'src/common/config';
import { ChangePasswordInput } from './models/change-password.input';
import { ProviderInfo } from './models/provider-info.dto';
import { SignupInput } from './models/signup.input';
import { UpdateUserInput } from './models/update-user.input';
import { PasswordService } from './password/password.service';
import { Token } from 'altair-graphql-core/build/types/api';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {}

  async createUser(
    payload: SignupInput,
    providerInfo?: ProviderInfo
  ): Promise<User> {
    // const hashedPassword = await this.passwordService.hashPassword(
    //   payload.password
    // );

    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          // password: hashedPassword,
          Workspace: {
            create: {
              name: 'My workspace',
            },
          },
          ...(providerInfo
            ? {
                UserCredential: {
                  create: {
                    provider: providerInfo.provider,
                    providerUserId: providerInfo.providerUserId,
                  },
                },
              }
            : {}),
        },
      });

      return user;
      // return this.generateTokens({
      //   userId: user.id,
      // });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  async passwordLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.getLoginResponse(user);
  }

  googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('No user from google');
    }

    return this.getLoginResponse(req.user);
  }

  getUserCredential(providerUserId: string, provider: IdentityProvider) {
    return this.prisma.userCredential.findFirst({
      where: {
        providerUserId,
        provider,
      },
    });
  }

  validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateUser(userId: string, newUserData: UpdateUserInput) {
    return this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
    });
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

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Generates a short-lived token for the purpose of event connection
   */
  getShortLivedToken(userId: string): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(
      { userId },
      {
        expiresIn: securityConfig.shortExpiresIn,
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
      expiresIn: securityConfig.refreshIn,
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
