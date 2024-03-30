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
    return {
      headers: {
        Authorization: `Basic ${btoa(
          `${options.data.username}:${options.data.password}`
        )}`,
      },
    };
  }
}
