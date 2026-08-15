import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { IdentityProvider } from '@altairgraphql/db';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { isObservable, lastValueFrom } from 'rxjs';
import { OAuthLoginTransactionService } from '../oauth-login-transaction.service';

type OAuthRequest = Request & { oauthState?: string };

@Injectable()
export class GoogleOAuthLoginGuard extends AuthGuard('google') {
  constructor(
    private readonly oauthLoginTransactionService: OAuthLoginTransactionService
  ) {
    super({ accessType: 'offline' });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OAuthRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const redirectUrl = request.query.state;

    if (typeof redirectUrl !== 'string') {
      throw new BadRequestException('Redirect URL is required');
    }

    const transaction = await this.oauthLoginTransactionService.create(
      IdentityProvider.GOOGLE,
      redirectUrl
    );
    request.oauthState = transaction.state;
    response.cookie('altair_oauth_transaction', transaction.browserBinding, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    const result = super.canActivate(context);
    return isObservable(result) ? lastValueFrom(result) : await result;
  }
}
