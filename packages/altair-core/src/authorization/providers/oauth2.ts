import { literal, object, output } from 'zod/v4';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
  baseAuthorizationProviderInputSchema,
} from '../authorization-provider';
import { accessTokenResponseSchema } from '../../oauth2/schema';

export const oAuth2AuthorizationProviderInputSchema =
  baseAuthorizationProviderInputSchema.extend({
    type: literal('oauth2'),
    /**
     * Data for the OAuth2 authorization provider
     */
    data: object({
      /**
       * OAuth2 access token response
       */
      accessTokenResponse: accessTokenResponseSchema.meta({
        description: 'OAuth2 access token response',
      }),
    }),
  });
export type OAuth2AuthorizationProviderInput = output<
  typeof oAuth2AuthorizationProviderInputSchema
>;
export default class OAuth2AuthorizationProvider extends AuthorizationProvider<OAuth2AuthorizationProviderInput> {
  async execute(
    options: AuthorizationProviderExecuteOptions<OAuth2AuthorizationProviderInput>
  ): Promise<AuthorizationResult> {
    if (!options.data?.accessTokenResponse) {
      return {
        headers: {},
      };
    }
    return {
      headers: {
        Authorization: `Bearer ${this.hydrate(options.data.accessTokenResponse.access_token)}`,
      },
    };
  }
}
