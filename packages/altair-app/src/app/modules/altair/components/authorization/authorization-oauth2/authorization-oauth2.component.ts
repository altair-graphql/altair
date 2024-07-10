import { Component, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import {
  AccessTokenResponse,
  AuthorizationRedirectErrorResponse,
  AuthorizationRedirectResponse,
  EVENT_TYPES,
  OAuth2Client,
  OAuth2ClientOptions,
  OAuth2Type,
  secureRandomString,
} from 'altair-graphql-core/build/oauth2';
import { NotifyService } from 'app/modules/altair/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-authorization-oauth2',
  templateUrl: './authorization-oauth2.component.html',
  styles: ``,
})
export class AuthorizationOauth2Component implements OnInit {
  urlConfig = getAltairConfig().getUrlConfig(
    environment.production ? 'production' : 'development'
  );
  form = this.formBuilder.group({
    type: OAuth2Type.AUTHORIZATION_CODE,
    clientId: '',
    clientSecret: '',
    redirectUri: `${this.urlConfig.loginClient}/oauth2`,
    authorizationEndpoint: '',
    tokenEndpoint: '',
    scope: '',
    codeVerifier: '',
    state: '',
    accessTokenResponse: undefined as unknown as AccessTokenResponse | undefined,
  });
  oauth2Type = OAuth2Type;
  @Input() authData?: unknown;
  @Output() authDataChange = this.form.valueChanges;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    if (this.authData) {
      this.form.patchValue(this.authData);
    }
  }

  getOAuthWindowUrl(): string {
    return `${this.urlConfig.loginClient}/oauth2?sc=${window.location.origin}`;
  }

  getOAuth2Options(): OAuth2ClientOptions {
    const {
      type,
      clientId,
      clientSecret,
      redirectUri,
      authorizationEndpoint,
      tokenEndpoint,
      scope,
      codeVerifier,
      state,
    } = this.form.value;

    if (!type) {
      throw new Error('type is required');
    }
    const oauthWindowUrl = this.getOAuthWindowUrl();

    return {
      type,
      clientId: clientId ?? '',
      clientSecret: clientSecret ?? '',
      redirectUri: redirectUri ?? oauthWindowUrl,
      authorizationEndpoint: authorizationEndpoint ?? '',
      tokenEndpoint: tokenEndpoint ?? '',
      scopes: scope?.split(' ') ?? [],
      codeVerifier: codeVerifier ? codeVerifier : secureRandomString(64),
      state: state ? state : btoa(redirectUri ?? oauthWindowUrl),
    };
  }

  async handleGetAccessToken(): Promise<void> {
    try {
      const accessTokenResponse = await this.getAccessToken();
      this.notifyService.success('Retrieved access token successfully');
      this.form.patchValue({
        accessTokenResponse,
      });
    } catch (err) {
      const msg = (err as any).message ?? err;
      this.notifyService.error(`Failed to retrieve access token: ${msg}`);
    }
  }

  async getAccessToken(): Promise<AccessTokenResponse> {
    const authorizationCode = await this.getAuthorizationCode();
    const client = new OAuth2Client(this.getOAuth2Options());
    const out = await client.getAccessTokenFromCode(authorizationCode);
    if ('error' in out) {
      throw new Error(out.error_description ?? out.error);
    }
    return out;
  }

  async getAuthorizationCode(): Promise<string> {
    const oauthWindowUrl = this.getOAuthWindowUrl();

    const oauth2Options = this.getOAuth2Options();

    const popup = window.open(oauthWindowUrl, '_blank', 'popup');
    if (!popup) {
      throw new Error('Could not create oauth popup!');
    }
    return new Promise<string>((resolve, reject) => {
      const listener = (message: MessageEvent) => {
        try {
          if (new URL(message.origin).origin !== new URL(oauthWindowUrl).origin) {
            return;
          }

          const type = message?.data?.type;
          switch (type) {
            case EVENT_TYPES.FRAME_READY:
              popup.postMessage(
                { type: EVENT_TYPES.ACTION, payload: oauth2Options },
                oauthWindowUrl
              );
              break;
            case EVENT_TYPES.AUTHORIZATION_CODE: {
              const payload:
                | AuthorizationRedirectResponse
                | AuthorizationRedirectErrorResponse = message.data.payload;

              window.removeEventListener('message', listener);
              if ('error' in payload) {
                return reject(new Error(payload.error_description ?? payload.error));
              }

              // verify state matches
              if (oauth2Options.state && payload.state !== oauth2Options.state) {
                return reject(new Error('state does not match'));
              }
              return resolve(payload.code);
            }
          }
        } catch (err) {
          return reject(err);
        }
      };

      window.addEventListener('message', listener);
    });
  }
}
