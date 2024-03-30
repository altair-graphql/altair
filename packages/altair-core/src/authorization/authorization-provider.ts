import { AuthorizationResult } from '../types/state/authorization.interface';

export interface AuthorizationProviderExecuteOptions<T = unknown> {
  // The input from the user
  data: T;
}

export abstract class AuthorizationProvider<T = unknown> {
  constructor(private hydrator: (data: string) => string) {}
  hydrate(data: string): string {
    return this.hydrator(data);
  }
  abstract execute(
    options: AuthorizationProviderExecuteOptions<T>
  ): Promise<AuthorizationResult>;
}
