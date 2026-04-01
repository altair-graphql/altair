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
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenInput } from './models/refresh-token.input';
import { VerifyEmailInput } from './models/verify-email.input';
import { EmailService } from 'src/email/email.service';
import { Throttle } from '@nestjs/throttler';
import { Config } from 'src/common/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<Config>,
    private emailService: EmailService
  ) {}

  private validateRedirectOrigin(url: URL): boolean {
    const allowedOrigins =
      this.configService.get<string[]>('allowedRedirectOrigins') ?? [];
    return allowedOrigins.some((allowed) => new URL(allowed).origin === url.origin);
  }

  @Get('google/login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(GoogleOAuthGuard)
  googleSignin() {
    // handled by the auth guard
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleSigninCallback(@Req() req: Request, @Res() res: Response) {
    const result = this.authService.googleLogin(req.user);
    if (req.query.state && typeof req.query.state === 'string') {
      try {
        const origin = new URL(req.query.state);
        // if (!this.validateRedirectOrigin(origin)) {
        //   throw new BadRequestException('Redirect origin not allowed');
        // }
        origin.searchParams.set('access_token', result.tokens.accessToken);
        return res.redirect(origin.href);
      } catch (err) {
        if (err instanceof BadRequestException) {
          throw err;
        }
        throw new BadRequestException('Invalid state provided');
      }
    }

    return res.redirect('https://altairgraphql.dev');
  }

  @Get('github/login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(GitHubOAuthGuard)
  githubSignin() {
    // handled by the auth guard
  }

  @Get('github/callback')
  @UseGuards(GitHubOAuthGuard)
  githubSigninCallback(@Req() req: Request, @Res() res: Response) {
    const result = this.authService.githubLogin(req.user);
    if (req.query.state && typeof req.query.state === 'string') {
      try {
        const origin = new URL(req.query.state);
        // if (!this.validateRedirectOrigin(origin)) {
        //   throw new BadRequestException('Redirect origin not allowed');
        // }
        origin.searchParams.set('access_token', result.tokens.accessToken);
        return res.redirect(origin.href);
      } catch (err) {
        if (err instanceof BadRequestException) {
          throw err;
        }
        throw new BadRequestException('Invalid state provided');
      }
    }

    return res.redirect('https://altairgraphql.dev');
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
}
