import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthModuleOptions, PassportStrategy } from '@nestjs/passport';
import { IdentityProvider, User } from '@altairgraphql/db';
import { Request } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { UserService } from '../user/user.service';

// https://www.jeansnyman.com/posts/authentication-in-express-with-google-and-facebook-using-passport-and-jwt/
// https://www.passportjs.org/concepts/authentication/google/
// https://www.sitepoint.com/spa-social-login-google-facebook/

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  authenticate(req: Request, options: Record<string, unknown>) {
    if (req.query.state) {
      options.state = req.query.state;
    }
    super.authenticate(req, options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<User> {
    try {
      // Search federated credentials where provider is Google and subject is profile.id
      // if not found, create new user and insert into federated credentials
      // If found, then get user ID from federated credential
      const identity = await this.authService.getUserCredential(
        profile.id,
        IdentityProvider.GOOGLE
      );
      if (!identity) {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          throw new UnauthorizedException(
            'Google OAuth did not return an email address'
          );
        }

        return this.userService.createUser(
          {
            email,
            firstName: profile?.name?.givenName ?? profile.displayName,
            lastName: profile?.name?.familyName,
            picture: profile?.photos?.[0]?.value,
          },
          {
            provider: IdentityProvider.GOOGLE,
            providerUserId: profile.id,
          }
        );
      }

      const user = await this.authService.validateUser(identity.userId);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
