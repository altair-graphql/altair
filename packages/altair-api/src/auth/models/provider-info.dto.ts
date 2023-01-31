import { IdentityProvider } from '@prisma/client';

export interface ProviderInfo {
  provider: IdentityProvider;
  providerUserId: string;
}
