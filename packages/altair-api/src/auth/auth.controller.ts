import {
  BadRequestException,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  googleSignin() {
    // handled by the auth guard
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleSigninCallback(@Req() req: Request, @Res() res: Response) {
    const result = this.authService.googleLogin(req);
    if (req.query.state && typeof req.query.state === 'string') {
      try {
        const origin = new URL(req.query.state);
        origin.searchParams.set('access_token', result.tokens.accessToken);
        return res.redirect(origin.href);
      } catch (err) {
        throw new BadRequestException('Invalid state provided');
      }
    }

    return res.redirect('https://altairgraphql.dev');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }

  @Get('slt')
  @UseGuards(JwtAuthGuard)
  getShortlivedEventsToken(@Req() req: Request) {
    const userId = req?.user?.id;
    if (!userId) {
      throw new BadRequestException('User not found');
    }

    return { slt: this.authService.getShortLivedEventsToken(userId) };
  }
}
