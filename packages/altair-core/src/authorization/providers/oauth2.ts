import { AccessTokenResponse } from '../../oauth2';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface OAuth2AuthorizationProviderInput {
  type: 'oauth2';
  data: {
    accessTokenResponse: AccessTokenResponse;
  };
}
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
