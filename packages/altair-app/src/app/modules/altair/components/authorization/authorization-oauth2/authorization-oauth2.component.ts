import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import {
  AccessTokenErrorResponse,
  AccessTokenResponse,
  AuthFormat,
  AuthorizationCodePKCE_OAuth2ClientOptions as AuthCodePKCEOAuth2ClientOpts,
  AuthorizationCode_OAuth2ClientOptions as AuthCodeOAuth2ClientOpts,
  AuthorizationRedirectErrorResponse,
  AuthorizationRedirectResponse,
  ClientCredentials_OAuth2ClientOptions as ClientCredentialsOAuth2ClientOpts,
  EVENT_TYPES,
  OAuth2Client,
  OAuth2ClientOptions,
  OAuth2Type,
  RequestFormat,
  secureRandomString,
} from 'altair-graphql-core/build/oauth2';
import { EnvironmentService, NotifyService } from 'app/modules/altair/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-authorization-oauth2',
  templateUrl: './authorization-oauth2.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
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
    scopes: '',
    codeVerifier: '',
    state: '',
    authFormat: AuthFormat.IN_BODY,
    requestFormat: RequestFormat.FORM,
    accessTokenResponse: undefined as unknown as AccessTokenResponse | undefined,
  });
  oauth2Type = OAuth2Type;
  authFormat = AuthFormat;
  requestFormat = RequestFormat;

  @Input() authData?: unknown;
  @Output() authDataChange = this.form.valueChanges;

  optionsShape = this.getOptionsShape();

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private notifyService: NotifyService,
    private readonly environmentService: EnvironmentService
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
      scopes,
      codeVerifier,
      state,
      authFormat,
      requestFormat,
    } = this.form.value;

    if (!type || !authFormat || !requestFormat) {
      throw new Error('type is required');
    }
    const oauthWindowUrl = this.getOAuthWindowUrl();

    return {
      type,
      clientId: this.environmentService.hydrate(clientId ?? ''),
      clientSecret: this.environmentService.hydrate(clientSecret ?? ''),
      redirectUri: this.environmentService.hydrate(redirectUri ?? oauthWindowUrl),
      authorizationEndpoint: this.environmentService.hydrate(
        authorizationEndpoint ?? ''
      ),
      tokenEndpoint: this.environmentService.hydrate(tokenEndpoint ?? ''),
      scopes:
        scopes?.split(' ').map((scope) => this.environmentService.hydrate(scope)) ??
        [],
      codeVerifier: this.environmentService.hydrate(
        codeVerifier ? codeVerifier : secureRandomString(64)
      ),
      state: this.environmentService.hydrate(
        state ? state : btoa(redirectUri ?? oauthWindowUrl)
      ),
      authFormat,
      requestFormat,
    };
  }

  async handleGetAccessToken(): Promise<void> {
    try {
      const accessTokenResponse = await this.getAccessToken();
      if ('error' in accessTokenResponse) {
        throw new Error(
          accessTokenResponse.error_description ?? accessTokenResponse.error
        );
      }
      this.notifyService.success('Retrieved access token successfully');
      this.form.patchValue({
        accessTokenResponse,
      });
    } catch (err) {
      const msg = (err as any).message ?? err;
      this.notifyService.error(`Failed to retrieve access token: ${msg}`);
    }
  }

  async getAccessToken(): Promise<AccessTokenResponse | AccessTokenErrorResponse> {
    const options = this.getOAuth2Options();
    const client = new OAuth2Client(options);
    if (options.type === OAuth2Type.CLIENT_CREDENTIALS) {
      return client.getAccessTokenFromClientCredentials();
    }

    const authorizationCode = await this.getAuthorizationCode();
    return client.getAccessTokenFromCode(authorizationCode);
  }

  async getAuthorizationCode(): Promise<string> {
    const oauth2Options = this.getOAuth2Options();
    if (oauth2Options.type === OAuth2Type.CLIENT_CREDENTIALS) {
      throw new Error(
        'Client Credentials flow not supported for authorization code'
      );
    }
    const oauthWindowUrl = this.getOAuthWindowUrl();

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

  getOptionsShape() {
    const authCodeOptionsShape: Record<keyof AuthCodeOAuth2ClientOpts, boolean> = {
      clientId: true,
      clientSecret: true,
      redirectUri: true,
      authorizationEndpoint: true,
      tokenEndpoint: true,
      state: true,
      type: true,
      authFormat: true,
      requestFormat: true,
      scopes: true,
    };

    const authCodePkceOptionsShape: Record<
      keyof AuthCodePKCEOAuth2ClientOpts,
      boolean
    > = {
      ...authCodeOptionsShape,
      codeVerifier: true,
    };

    const clientCredentialsOptionsShape: Record<
      keyof ClientCredentialsOAuth2ClientOpts,
      boolean
    > = {
      clientId: true,
      clientSecret: true,
      tokenEndpoint: true,
      type: true,
      authFormat: true,
      requestFormat: true,
      scopes: true,
    };

    return {
      [OAuth2Type.AUTHORIZATION_CODE]: authCodeOptionsShape,
      [OAuth2Type.AUTHORIZATION_CODE_PKCE]: authCodePkceOptionsShape,
      [OAuth2Type.CLIENT_CREDENTIALS]: clientCredentialsOptionsShape,
    };
  }

  isEnabledField(
    field: KeysOfUnion<
      ReturnType<AuthorizationOauth2Component['getOptionsShape']>[OAuth2Type]
    >
  ) {
    return (
      this.form.value.type && (this.optionsShape[this.form.value.type] as any)[field]
    );
  }
}
type KeysOfUnion<T> = T extends T ? keyof T : never;
