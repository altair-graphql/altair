import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { OAuth2Strategy, Profile } from 'passport-google-oauth';
import { AuthService } from '../auth.service';

// https://www.jeansnyman.com/posts/authentication-in-express-with-google-and-facebook-using-passport-and-jwt/
// https://www.passportjs.org/concepts/authentication/google/
// https://www.sitepoint.com/spa-social-login-google-facebook/

@Injectable()
export class GoogleStrategy extends PassportStrategy(OAuth2Strategy) {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<User> {
    // TODO: Search federated credentials where provider is Google and subject is profile.id
    // TODO: if not found, create new user and insert into federated credentials
    // TODO: If found, then get user ID from federated credential
    throw new Error('Not yet implemented');
    // const user = await this.authService.validateUser(profile.userId);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
  }
}
