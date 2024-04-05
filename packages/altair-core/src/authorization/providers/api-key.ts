import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
} from '../authorization-provider';

export interface ApiKeyAuthorizationProviderData {
  key: string;
  value: string;
}
export default class ApiKeyAuthorizationProvider extends AuthorizationProvider<ApiKeyAuthorizationProviderData> {
  async execute(
    options: AuthorizationProviderExecuteOptions<ApiKeyAuthorizationProviderData>
  ): Promise<AuthorizationResult> {
    return {
      headers: {
        [options.data.key]: this.hydrate(options.data.value),
      },
    };
  }
}
