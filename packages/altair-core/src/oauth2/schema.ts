import { number, object, string } from 'zod/v4';

export const accessTokenResponseSchema = object({
  /**
   * The access token issued by the authorization server
   */
  access_token: string().meta({
    description: 'The access token issued by the authorization server',
  }),
  /**
   * The type of the token issued
   */
  token_type: string().meta({ description: 'The type of the token issued' }),
  /**
   * The exact value of the state parameter passed by the client in the authorization request
   */
  state: string().meta({
    description:
      'The exact value of the state parameter passed by the client in the authorization request',
  }),
  /**
   * The lifetime in seconds of the access token
   */
  expires_in: number()
    .meta({ description: 'The lifetime in seconds of the access token' })
    .optional(),
  /**
   * The refresh token issued by the authorization server
   */
  refresh_token: string()
    .meta({ description: 'The refresh token issued by the authorization server' })
    .optional(),
  /**
   * The ID token issued by the authorization server
   */
  id_token: string()
    .meta({ description: 'The ID token issued by the authorization server' })
    .optional(),
  /**
   * The scopes granted by the access token
   */
  scope: string()
    .meta({ description: 'The scopes granted by the access token' })
    .optional(),
});

export const accessTokenErrorResponseSchema = object({
  /**
   * A single ASCII error code
   */
  error: string().meta({ description: 'A single ASCII error code' }),
  /**
   * The exact value of the state parameter passed by the client in the authorization request
   */
  state: string().meta({
    description:
      'The exact value of the state parameter passed by the client in the authorization request',
  }),
  /**
   * Human-readable ASCII text providing additional information about the error
   */
  error_description: string()
    .meta({
      description:
        'Human-readable ASCII text providing additional information about the error',
    })
    .optional(),
  /**
   * A URI identifying a human-readable web page with information about the error
   */
  error_uri: string()
    .meta({
      description:
        'A URI identifying a human-readable web page with information about the error',
    })
    .optional(),
});
