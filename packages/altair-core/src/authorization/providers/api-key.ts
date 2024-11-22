import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
  BaseAuthorizationProviderInput,
} from '../authorization-provider';

export interface ApiKeyAuthorizationProviderInput
  extends BaseAuthorizationProviderInput {
  type: 'api-key';
  data: {
    headerName: string;
    headerValue: string;
  };
}
export default class ApiKeyAuthorizationProvider extends AuthorizationProvider<ApiKeyAuthorizationProviderInput> {
  async execute(
    options: AuthorizationProviderExecuteOptions<ApiKeyAuthorizationProviderInput>
  ): Promise<AuthorizationResult> {
    if (!options.data?.headerName || !options.data?.headerValue) {
      return {
        headers: {},
      };
    }

    return {
      headers: {
        [options.data.headerName]: this.hydrate(options.data.headerValue),
      },
    };
  }
}
