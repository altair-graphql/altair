import { object, output, string, unknown } from 'zod/v4';
import { AuthorizationResult } from '../types/state/authorization.interface';

export interface AuthorizationProviderExecuteOptions<
  T extends BaseAuthorizationProviderInput = BaseAuthorizationProviderInput,
> {
  // The input from the user
  data: T['data'] | undefined;
}

export const baseAuthorizationProviderInputSchema = object({
  type: string().meta({ description: 'Type of authorization provider' }),
  data: unknown().meta({ description: 'Data for the authorization provider' }),
});
export type BaseAuthorizationProviderInput = output<
  typeof baseAuthorizationProviderInputSchema
>;

export abstract class AuthorizationProvider<
  T extends BaseAuthorizationProviderInput = BaseAuthorizationProviderInput,
> {
  constructor(private hydrator: (data: string) => string) {}
  hydrate(data: string): string {
    return this.hydrator(data);
  }
  abstract execute(
    options: AuthorizationProviderExecuteOptions<T>
  ): Promise<AuthorizationResult>;
}
