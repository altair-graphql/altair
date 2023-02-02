import { IdentityProvider } from '@altairgraphql/db';

export interface ProviderInfo {
  provider: IdentityProvider;
  providerUserId: string;
}
