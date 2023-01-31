import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
      const origin = new URL(req.query.state);
      origin.searchParams.set('access_token', result.tokens.accessToken);

      return res.redirect(origin.href);
    }

    return res.redirect('https://altairgraphql.dev');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }

  @Get('me/teams')
  @UseGuards(JwtAuthGuard)
  getUserTeams(@Req() req: Request) {
    return this.authService.getUserTeams(req.user.id);
  }

  @Get('slt')
  @UseGuards(JwtAuthGuard)
  getShortlivedToken(@Req() req: Request) {
    return { slt: this.authService.getShortLivedToken(req.user.id) };
  }
}
