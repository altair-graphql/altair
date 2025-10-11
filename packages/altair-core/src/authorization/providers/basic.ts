import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface BasicAuthorizationProviderInput {
  type: 'basic';
  data: {
    username: string;
    password: string;
  };
}
export default class BasicAuthorizationProvider extends AuthorizationProvider<BasicAuthorizationProviderInput> {
  async execute(
    options: AuthorizationProviderExecuteOptions<BasicAuthorizationProviderInput>
  ): Promise<AuthorizationResult> {
    if (!options.data?.username || !options.data?.password) {
      return {
        headers: {},
      };
    }
    return {
      headers: {
        Authorization: `Basic ${btoa(
          `${this.hydrate(options.data.username)}:${this.hydrate(options.data.password)}`
        )}`,
      },
    };
  }
}
