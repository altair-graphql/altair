import { getCodeChallenge } from './helpers';
import {
  AccessTokenErrorResponse,
  AccessTokenRequest,
  AccessTokenResponse,
  AuthFormat,
  AuthorizationRedirectErrorResponse,
  AuthorizationRedirectResponse,
  AuthorizationRequestParams,
  OAuth2Type,
  RequestFormat,
} from './types';

interface CommonOAuth2ClientOptions {
  scopes: string[];
  authFormat: AuthFormat;
  requestFormat: RequestFormat;
}
export interface AuthorizationCode_OAuth2ClientOptions
  extends CommonOAuth2ClientOptions {
  type: OAuth2Type.AUTHORIZATION_CODE;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  /**
   * An opaque string used to store request-specific data and/or prevent CSRF attacks by verifying the value of state later
   */
  state: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

export interface AuthorizationCodePKCE_OAuth2ClientOptions
  extends Omit<AuthorizationCode_OAuth2ClientOptions, 'type'> {
  type: OAuth2Type.AUTHORIZATION_CODE_PKCE;
  /**
   * A cryptographically random string between 43 and 128 characters long that will be used to verify the authorization code
   * using the character set [A-Z, a-z, 0-9, "-", ".", "_", "~"]
   */
  codeVerifier: string;
}

export interface ClientCredentials_OAuth2ClientOptions
  extends CommonOAuth2ClientOptions {
  type: OAuth2Type.CLIENT_CREDENTIALS;
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
}

export type OAuth2ClientOptions =
  | AuthorizationCode_OAuth2ClientOptions
  | AuthorizationCodePKCE_OAuth2ClientOptions
  | ClientCredentials_OAuth2ClientOptions;

export class OAuth2Client {
  constructor(private options: OAuth2ClientOptions) {}

  async getAuthorizationUrl(): Promise<string> {
    if (this.options.type === OAuth2Type.CLIENT_CREDENTIALS) {
      throw new Error(
        'Client Credentials flow not supported for authorization code'
      );
    }
    const params: AuthorizationRequestParams = {
      response_type: 'code',
      client_id: this.options.clientId,
      redirect_uri: this.options.redirectUri,
      state: this.options.state,
      scope: this.options.scopes.join(' '),
      ...(this.options.type === 'auth_code_pkce'
        ? {
            code_challenge: await getCodeChallenge(this.options.codeVerifier),
            code_challenge_method: 'S256',
          }
        : {}),
    };
    const urlParams = new URLSearchParams(params);
    const u = new URL(this.options.authorizationEndpoint);
    const url = new URL(`${u.origin}${u.pathname}?${urlParams.toString()}`);
    return url.toString();
  }

  async getAuthorizationRedirectResponse(): Promise<
    AuthorizationRedirectResponse | AuthorizationRedirectErrorResponse | undefined
  > {
    if (this.options.type === OAuth2Type.CLIENT_CREDENTIALS) {
      throw new Error(
        'Client Credentials flow not supported for authorization code'
      );
    }
    // Get params from url
    const url = new URL(window.location.href);
    const obj = Object.fromEntries(url.searchParams.entries());
    if (obj.error) {
      return {
        error: obj.error,
        state: obj.state ?? '',
        error_description: obj.error_description,
        error_uri: obj.error_uri,
      };
    }

    // Validate params
    if (!obj.code || !obj.state) {
      return;
    }

    // verify state is the same as the one generated
    if (obj.state !== this.options.state) {
      return {
        error: 'invalid_state',
        state: obj.state,
        error_description: 'The state is invalid',
      };
    }

    // Return params
    return { code: obj.code, state: obj.state };
  }

  // Since this will be a CORS request, we only support it in the desktop app for now
  async getAccessTokenFromCode(
    code: string
  ): Promise<AccessTokenResponse | AccessTokenErrorResponse> {
    if (this.options.type === OAuth2Type.CLIENT_CREDENTIALS) {
      throw new Error('Client Credentials flow not supported');
    }
    const params: AccessTokenRequest = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.options.redirectUri,
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      ...(this.options.type === 'auth_code_pkce'
        ? { code_verifier: this.options.codeVerifier }
        : {}),
    };
    return this.makeAccessTokenRequest(params);
  }

  async getAccessTokenFromClientCredentials(): Promise<
    AccessTokenResponse | AccessTokenErrorResponse
  > {
    if (this.options.type !== OAuth2Type.CLIENT_CREDENTIALS) {
      throw new Error('Only Client Credentials flow is supported');
    }

    const params: AccessTokenRequest = {
      grant_type: 'client_credentials',
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      scope: this.options.scopes.join(' '),
    };

    return this.makeAccessTokenRequest(params);
  }

  private getAccessTokenRequestHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    switch (this.options.authFormat) {
      case AuthFormat.BASIC_AUTH: {
        headers.Authorization = `Basic ${btoa(
          `${this.options.clientId}:${this.options.clientSecret}`
        )}`;
        break;
      }
    }

    switch (this.options.requestFormat) {
      case RequestFormat.JSON: {
        headers.Accept = 'application/json';
        headers['Content-Type'] = 'application/json';
        break;
      }

      case RequestFormat.FORM: {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        break;
      }
    }

    return headers;
  }

  private getAccessTokenRequestBody(params: AccessTokenRequest): BodyInit {
    let bodyParams: Partial<AccessTokenRequest> = structuredClone(params);
    switch (this.options.authFormat) {
      case AuthFormat.BASIC_AUTH: {
        const { client_id, client_secret, ...rest } = params;
        bodyParams = rest;
        break;
      }
    }

    switch (this.options.requestFormat) {
      case RequestFormat.JSON:
        return JSON.stringify(bodyParams);
      case RequestFormat.FORM:
        return new URLSearchParams({ ...bodyParams }).toString();
    }
  }

  private async makeAccessTokenRequest(
    params: AccessTokenRequest
  ): Promise<AccessTokenResponse | AccessTokenErrorResponse> {
    const response = await fetch(this.options.tokenEndpoint, {
      method: 'POST',
      headers: this.getAccessTokenRequestHeaders(),
      body: this.getAccessTokenRequestBody(params),
    });
    const data = await response.json();
    return data;
  }
}
/*
in app:
listen for ready message from auth window
send [options + action] to the auth window
listen for authorization code from auth window
close auth window
exchange code for access token

in auth window:
send ready message to app
listen for options message from app
- redirect to authorization url
- get code from url
- send code to app
*/
