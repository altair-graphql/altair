import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IdentityProvider, User } from '@altairgraphql/db';
import { Request } from 'express';
import { Profile, Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get('GITHUB_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_OAUTH_CLIENT_SECRET'),
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
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
      // Search federated credentials where provider is GitHub and subject is profile.id
      // if not found, create new user and insert into federated credentials
      // If found, then get user ID from federated credential
      const identity = await this.authService.getUserCredential(
        profile.id,
        IdentityProvider.GITHUB
      );
      if (!identity) {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          throw new UnauthorizedException(
            'GitHub OAuth did not return an email address'
          );
        }

        return this.userService.createUser(
          {
            email,
            firstName: profile.displayName || profile.username || 'GitHub User',
            lastName: undefined,
            picture: profile.photos?.[0]?.value,
          },
          {
            provider: IdentityProvider.GITHUB,
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
