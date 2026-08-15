import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { isObservable, lastValueFrom } from 'rxjs';
import { IdentityProvider } from '@altairgraphql/db';
import { OAuthLoginTransactionService } from '../oauth-login-transaction.service';

interface OAuthRequest extends Request {
  oauthState?: string;
}

@Injectable()
export class GitHubOAuthLoginGuard extends AuthGuard('github') {
  constructor(
    private readonly oauthLoginTransactionService: OAuthLoginTransactionService
  ) {
    super({ accessType: 'offline' });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OAuthRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const redirectUrl = request.query.state;
    const codeChallenge = request.query.code_challenge;

    if (typeof redirectUrl !== 'string' || typeof codeChallenge !== 'string') {
      throw new BadRequestException(
        'OAuth redirect URL and code challenge are required'
      );
    }

    const transaction = await this.oauthLoginTransactionService.create(
      IdentityProvider.GITHUB,
      redirectUrl,
      codeChallenge
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
