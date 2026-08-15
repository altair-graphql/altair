import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { IdentityProvider, User } from '@altairgraphql/db';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { GoogleOAuthLoginGuard } from './guards/google-oauth-login.guard';
import { GitHubOAuthLoginGuard } from './guards/github-oauth-login.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenInput } from './models/refresh-token.input';
import { VerifyEmailInput } from './models/verify-email.input';
import { RedeemOAuthHandoffInput } from './models/redeem-oauth-handoff.input';
import { EmailService } from 'src/email/email.service';
import { Throttle } from '@nestjs/throttler';
import { Config } from 'src/common/config';
import { OAuthLoginTransactionService } from './oauth-login-transaction.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<Config>,
    private emailService: EmailService,
    private oauthLoginTransactionService: OAuthLoginTransactionService
  ) {}

  private validateRedirectOrigin(url: URL): boolean {
    const allowedOrigins =
      this.configService.get<string[]>('allowedRedirectOrigins') ?? [];
    return allowedOrigins.some((allowed) => new URL(allowed).origin === url.origin);
  }

  @Get('google/login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(GoogleOAuthLoginGuard)
  googleSignin() {
    // handled by the auth guard
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleSigninCallback(@Req() req: Request, @Res() res: Response) {
    const user = this.authService.googleLogin(req.user as User);
    return this.completeOAuthLogin(IdentityProvider.GOOGLE, req, res, user.id);
  }

  @Get('github/login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(GitHubOAuthLoginGuard)
  githubSignin() {
    // handled by the auth guard
  }

  @Get('github/callback')
  @UseGuards(GitHubOAuthGuard)
  async githubSigninCallback(@Req() req: Request, @Res() res: Response) {
    const user = this.authService.githubLogin(req.user as User);
    return this.completeOAuthLogin(IdentityProvider.GITHUB, req, res, user.id);
  }

  @Post('exchange')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async redeemOAuthHandoff(
    @Body() body: RedeemOAuthHandoffInput,
    @Req() req: Request
  ) {
    const origin = req.headers.origin;
    if (
      typeof origin !== 'string' ||
      !this.oauthLoginTransactionService.isAllowedRedirectOrigin(origin)
    ) {
      throw new BadRequestException('OAuth handoff origin not allowed');
    }

    const userId = await this.oauthLoginTransactionService.redeem(
      body.handoffCode,
      body.codeVerifier,
      origin
    );
    return { tokens: this.authService.generateTokens({ userId }) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Req() req: Request) {
    return this.authService.getUserProfile(req.user);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  refreshToken(@Body() body: RefreshTokenInput) {
    return this.authService.refreshToken(body.token);
  }

  @Get('slt')
  @UseGuards(JwtAuthGuard)
  getShortlivedEventsToken(@Req() req: Request) {
    const userId = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return { slt: this.authService.getShortLivedEventsToken(userId) };
  }

  @Post('send-verification')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(
    @Req() req: Request,
    @Body() body: { callbackUrl?: string }
  ) {
    const userId = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.authService.generateEmailVerificationToken(userId);

    // Build the verification URL
    const allowedOrigins: string[] =
      this.configService.get('allowedRedirectOrigins', {
        infer: true,
      }) ?? [];
    let baseUrl = 'https://altairgraphql.dev';

    if (body.callbackUrl) {
      try {
        const callbackOrigin = new URL(body.callbackUrl);
        const isAllowed = allowedOrigins.some(
          (allowed) => new URL(allowed).origin === callbackOrigin.origin
        );
        if (isAllowed) {
          baseUrl = body.callbackUrl;
        }
      } catch {
        // ignore invalid URL, use default
      }
    }

    const verificationUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;

    await this.emailService.sendVerificationEmail(userId, verificationUrl);

    return { sent: true };
  }

  @Post('verify-email')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async verifyEmail(@Body() body: VerifyEmailInput) {
    return this.authService.verifyEmail(body.token);
  }

  private async completeOAuthLogin(
    provider: IdentityProvider,
    req: Request,
    res: Response,
    userId: string
  ) {
    const state = req.query.state;
    const browserBinding = this.getCookie(
      req.headers?.cookie,
      'altair_oauth_transaction'
    );
    if (typeof state !== 'string' || !browserBinding) {
      throw new BadRequestException('Invalid or expired OAuth transaction');
    }

    const transaction = await this.oauthLoginTransactionService.complete(
      provider,
      state,
      browserBinding,
      userId
    );
    res.clearCookie('altair_oauth_transaction');

    const redirectUrl = new URL(transaction.redirectUrl);
    redirectUrl.searchParams.set('handoff_code', transaction.handoffCode);
    return res.redirect(redirectUrl.href);
  }

  private getCookie(header: string | undefined, name: string): string | undefined {
    if (!header) {
      return undefined;
    }

    return header
      .split(';')
      .map((cookie) => {
        const trimmed = cookie.trim();
        const separatorIndex = trimmed.indexOf('=');
        return separatorIndex === -1
          ? ([trimmed, ''] as const)
          : ([
              trimmed.slice(0, separatorIndex),
              trimmed.slice(separatorIndex + 1),
            ] as const);
      })
      .find(([key]) => key === name)?.[1];
  }
}
