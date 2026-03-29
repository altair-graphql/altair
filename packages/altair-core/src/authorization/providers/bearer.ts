import { literal, object, output, string } from 'zod/v4';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
  baseAuthorizationProviderInputSchema,
} from '../authorization-provider';

export const bearerAuthorizationProviderInputSchema =
  baseAuthorizationProviderInputSchema.extend({
    type: literal('bearer'),
    data: object({
      token: string().meta({ description: 'Bearer token for authorization' }),
    }),
  });
export type BearerAuthorizationProviderInput = output<
  typeof bearerAuthorizationProviderInputSchema
>;
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
