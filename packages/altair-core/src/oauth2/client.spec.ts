import { describe, expect, it } from '@jest/globals';
import { OAuth2Client } from './client';
import { OAuth2Type } from './types';

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
      });

      const url = await client.getAuthorizationUrl();
      expect(url).toBe(
        'https://auth-server.com/oauth/authorize?response_type=code&client_id=clientId&redirect_uri=redirectUri&state=random-state&scope=scope1+scope2&code_challenge=N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928&code_challenge_method=S256'
      );
    });
  });
});
