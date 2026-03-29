import { literal, object, output, string } from 'zod/v4';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
  baseAuthorizationProviderInputSchema,
} from '../authorization-provider';

export const apiKeyAuthorizationProviderInputSchema =
  baseAuthorizationProviderInputSchema.extend({
    type: literal('api-key'),
    data: object({
      headerName: string().meta({
        description: 'Name of the header to set the API key in',
      }),
      headerValue: string().meta({
        description: 'Value of the API key to set in the header',
      }),
    }),
  });
export type ApiKeyAuthorizationProviderInput = output<
  typeof apiKeyAuthorizationProviderInputSchema
>;
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
