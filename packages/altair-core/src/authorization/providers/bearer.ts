import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface BearerAuthorizationProviderInput {
  type: 'bearer';
  data: {
    token: string;
  };
}
export default class BearerAuthorizationProvider extends AuthorizationProvider<BearerAuthorizationProviderInput> {
  async execute(
    options: AuthorizationProviderExecuteOptions<BearerAuthorizationProviderInput>
  ): Promise<AuthorizationResult> {
    if (!options.data?.token) {
      return {
        headers: {},
      };
    }
    return {
      headers: {
        Authorization: `Bearer ${this.hydrate(options.data.token)}`,
      },
    };
  }
}
