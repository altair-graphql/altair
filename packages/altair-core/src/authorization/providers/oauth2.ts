import { AccessTokenResponse } from '../../oauth2';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface OAuth2AuthorizationProviderData {
  accessTokenResponse: AccessTokenResponse;
}
export default class OAuth2AuthorizationProvider extends AuthorizationProvider<OAuth2AuthorizationProviderData> {
  async execute(
    options: AuthorizationProviderExecuteOptions<OAuth2AuthorizationProviderData>
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
