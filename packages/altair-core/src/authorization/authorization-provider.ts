import { AuthorizationResult } from '../types/state/authorization.interface';

export interface AuthorizationProviderExecuteOptions<
  T extends BaseAuthorizationProviderInput = BaseAuthorizationProviderInput,
> {
  // The input from the user
  data: T['data'] | undefined;
}

export interface BaseAuthorizationProviderInput {
  type: string;
  data: unknown;
}

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
