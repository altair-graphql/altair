import { literal, object, output, string } from 'zod/v4';
import { AuthorizationResult } from '../../types/state/authorization.interface';
import {
  AuthorizationProvider,
  AuthorizationProviderExecuteOptions,
  baseAuthorizationProviderInputSchema,
} from '../authorization-provider';

export const basicAuthorizationProviderInputSchema =
  baseAuthorizationProviderInputSchema.extend({
    type: literal('basic'),
    data: object({
      username: string().meta({
        description: 'Username for basic authentication',
      }),
      password: string().meta({
        description: 'Password for basic authentication',
      }),
    }),
  });
export type BasicAuthorizationProviderInput = output<
  typeof basicAuthorizationProviderInputSchema
>;
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
