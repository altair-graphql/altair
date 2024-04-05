import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface BasicAuthorizationProviderData {
  username: string;
  password: string;
}
export default class BasicAuthorizationProvider extends AuthorizationProvider<BasicAuthorizationProviderData> {
  async execute(
    options: AuthorizationProviderExecuteOptions<BasicAuthorizationProviderData>
  ): Promise<AuthorizationResult> {
    if (!options.data.username || !options.data.password) {
      return {
        headers: {},
      };
    }
    return {
      headers: {
        Authorization: `Basic ${(await import('abab')).btoa(
          `${this.hydrate(options.data.username)}:${this.hydrate(options.data.password)}`
        )}`,
      },
    };
  }
}
