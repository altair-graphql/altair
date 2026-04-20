import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OAuth2Client } from './client';
import { AuthFormat, OAuth2Type, RequestFormat } from './types';
import { setupServer } from 'msw/node';
import { MswMockRequestHandler } from '../test-helpers';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('oauth2 client', () => {
  describe('getAuthorizationUrl', () => {
    it('should return the authorization url', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      const url = await client.getAuthorizationUrl();
      expect(url).toBe(
        'https://auth-server.com/oauth/authorize?response_type=code&client_id=clientId&redirect_uri=redirectUri&state=random-state&scope=scope1+scope2&code_challenge=N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928&code_challenge_method=S256'
      );
    });

    it('should throw an error if the flow is client credentials', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      await expect(client.getAuthorizationUrl()).rejects.toThrow(
        'Client Credentials flow not supported for authorization code'
      );
    });
  });
  describe('getAuthorizationRedirectResponse', () => {
    it('should return the authorization redirect response', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      location.href =
        'https://auth-server.com/oauth/authorize?code=code&state=random-state';
      const response = await client.getAuthorizationRedirectResponse();

      expect(response).toEqual({
        code: 'code',
        state: 'random-state',
      });
    });

    it('should return the authorization redirect error response', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      location.href =
        'https://auth-server.com/oauth/authorize?error=access_denied&state=random-state&error_description=access+is+denied&error_uri=https%3A%2F%2Fauth-server.com%2Ferror';
      const response = await client.getAuthorizationRedirectResponse();

      expect(response).toEqual({
        error: 'access_denied',
        state: 'random-state',
        error_description: 'access is denied',
        error_uri: 'https://auth-server.com/error',
      });
    });

    it('should return error if the state does not match', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      location.href =
        'https://auth-server.com/oauth/authorize?code=code&state=random-state-2';
      const response = await client.getAuthorizationRedirectResponse();

      expect(response).toEqual({
        error: 'invalid_state',
        error_description: 'The state is invalid',
        state: 'random-state-2',
      });
    });

    it('should return undefined if the state is missing', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      location.href = 'https://auth-server.com/oauth/authorize?code=code';
      const response = await client.getAuthorizationRedirectResponse();

      expect(response).toBeUndefined();
    });
    it('should throw an error if the flow is client credentials', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      location.href =
        'https://auth-server.com/oauth/authorize?code=code&state=random-state';
      await expect(client.getAuthorizationRedirectResponse()).rejects.toThrow(
        'Client Credentials flow not supported for authorization code'
      );
    });
  });

  describe('getAccessTokenFromCode', () => {
    it('should return the access token from code (authFormat: in body, requestFormat: JSON)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromCode('code');

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        accept: 'application/json',
        'content-type': 'application/json',
      });
      expect(await receivedRequest?.json()).toEqual({
        grant_type: 'authorization_code',
        code: 'code',
        redirect_uri: 'redirectUri',
        client_id: 'clientId',
        client_secret: 'clientSecret',
        code_verifier: 'codeVerifier',
      });
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from code (authFormat: basic auth, requestFormat: JSON)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.BASIC_AUTH,
        requestFormat: RequestFormat.JSON,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromCode('code');

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
      });
      expect(await receivedRequest?.json()).toEqual({
        grant_type: 'authorization_code',
        code: 'code',
        redirect_uri: 'redirectUri',
        code_verifier: 'codeVerifier',
      });
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from code (authFormat: in body, requestFormat: form)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.FORM,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromCode('code');

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        'content-type': 'application/x-www-form-urlencoded',
      });
      expect(await receivedRequest?.text()).toEqual(
        'grant_type=authorization_code&code=code&redirect_uri=redirectUri&client_id=clientId&client_secret=clientSecret&code_verifier=codeVerifier'
      );
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from code (authFormat: basic auth, requestFormat: form)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.BASIC_AUTH,
        requestFormat: RequestFormat.FORM,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromCode('code');

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        'content-type': 'application/x-www-form-urlencoded',
        authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
      });
      expect(await receivedRequest?.text()).toEqual(
        'grant_type=authorization_code&code=code&redirect_uri=redirectUri&code_verifier=codeVerifier'
      );
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should throw an error if the flow is client credentials', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      await expect(client.getAccessTokenFromCode('code')).rejects.toThrow(
        'Client Credentials flow not supported'
      );
    });
  });

  describe('getAccessTokenFromClientCredentials', () => {
    it('should return the access token from client credentials (authFormat: in body, requestFormat: JSON)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.JSON,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromClientCredentials();

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        accept: 'application/json',
        'content-type': 'application/json',
      });
      expect(await receivedRequest?.json()).toEqual({
        grant_type: 'client_credentials',
        client_id: 'clientId',
        client_secret: 'clientSecret',
        scope: 'scope1 scope2',
      });
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from client credentials (authFormat: basic auth, requestFormat: JSON)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.BASIC_AUTH,
        requestFormat: RequestFormat.JSON,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromClientCredentials();

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
      });
      expect(await receivedRequest?.json()).toEqual({
        grant_type: 'client_credentials',
        scope: 'scope1 scope2',
      });
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from client credentials (authFormat: in body, requestFormat: form)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.FORM,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromClientCredentials();

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        'content-type': 'application/x-www-form-urlencoded',
      });
      expect(await receivedRequest?.text()).toEqual(
        'grant_type=client_credentials&client_id=clientId&client_secret=clientSecret&scope=scope1+scope2'
      );
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should return the access token from client credentials (authFormat: basic auth, requestFormat: form)', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.CLIENT_CREDENTIALS,
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopes: ['scope1', 'scope2'],
        authFormat: AuthFormat.BASIC_AUTH,
        requestFormat: RequestFormat.FORM,
      });

      const mockHandler = new MswMockRequestHandler(
        'https://auth-server.com/oauth/token',
        async () => {
          return Response.json({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
          });
        }
      );

      server.use(mockHandler);

      const response = await client.getAccessTokenFromClientCredentials();

      const receivedRequest = mockHandler.receivedRequest();
      expect(receivedRequest?.method).toBe('POST');
      expect(Object.fromEntries(receivedRequest?.headers as any)).toEqual({
        'content-type': 'application/x-www-form-urlencoded',
        authorization: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
      });
      expect(await receivedRequest?.text()).toEqual(
        'grant_type=client_credentials&scope=scope1+scope2'
      );
      expect(response).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    });

    it('should throw an error if the flow is not client credentials', async () => {
      const client = new OAuth2Client({
        type: OAuth2Type.AUTHORIZATION_CODE_PKCE,
        authorizationEndpoint: 'https://auth-server.com/oauth/authorize',
        tokenEndpoint: 'https://auth-server.com/oauth/token',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        redirectUri: 'redirectUri',
        scopes: ['scope1', 'scope2'],
        codeVerifier: 'codeVerifier',
        state: 'random-state',
        authFormat: AuthFormat.IN_BODY,
        requestFormat: RequestFormat.FORM,
      });

      await expect(client.getAccessTokenFromClientCredentials()).rejects.toThrow(
        'Only Client Credentials flow is supported'
      );
    });
  });

  // getAuthorizationRedirectResponse
  // getAccessTokenFromCode
  // getAccessTokenFromClientCredentials
});
