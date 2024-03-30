import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface BearerAuthorizationProviderData {
  token: string;
}
export default class BearerAuthorizationProvider extends AuthorizationProvider<BearerAuthorizationProviderData> {
  async execute(
    options: AuthorizationProviderExecuteOptions<BearerAuthorizationProviderData>
  ): Promise<AuthorizationResult> {
    return {
      headers: {
        Authorization: `Bearer ${options.data.token}`,
      },
    };
  }
}
