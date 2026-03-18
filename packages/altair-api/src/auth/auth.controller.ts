import {
  BadRequestException,
  Controller,
  Get,
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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  private validateRedirectOrigin(url: URL): boolean {
    const allowedOrigins =
      this.configService.get<string[]>('allowedRedirectOrigins') ?? [];
    return allowedOrigins.some((allowed) => new URL(allowed).origin === url.origin);
  }

  @Get('google/login')
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

  @Get('slt')
  @UseGuards(JwtAuthGuard)
  getShortlivedEventsToken(@Req() req: Request) {
    const userId = req?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return { slt: this.authService.getShortLivedEventsToken(userId) };
  }
}
