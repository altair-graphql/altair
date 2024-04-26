import { AuthorizationProvider } from 'altair-graphql-core/build/authorization/authorization-provider';
import {
  AUTHORIZATION_TYPES,
  AuthorizationTypes,
} from 'altair-graphql-core/build/types/state/authorization.interface';

export const AUTHORIZATION_MAPPING: Record<
  AuthorizationTypes,
  {
    copy: string;
    getProviderClass?: () => Promise<
      new (hydrator: (data: string) => string) => AuthorizationProvider
    >;
  }
> = {
  [AUTHORIZATION_TYPES.NONE]: {
    copy: 'AUTHORIZATION_PROVIDER_NONE',
  },
  [AUTHORIZATION_TYPES.BASIC]: {
    copy: 'AUTHORIZATION_PROVIDER_BASIC',
    async getProviderClass() {
      return (
        await import('altair-graphql-core/build/authorization/providers/basic')
      ).default;
    },
  },
  [AUTHORIZATION_TYPES.BEARER]: {
    copy: 'AUTHORIZATION_PROVIDER_BEARER',
    async getProviderClass() {
      return (
        await import('altair-graphql-core/build/authorization/providers/bearer')
      ).default;
    },
  },
  [AUTHORIZATION_TYPES.API_KEY]: {
    copy: 'AUTHORIZATION_PROVIDER_API_KEY',
    async getProviderClass() {
      return (
        await import('altair-graphql-core/build/authorization/providers/api-key')
      ).default;
    },
  },
  [AUTHORIZATION_TYPES.OAUTH2]: {
    copy: 'AUTHORIZATION_PROVIDER_OAUTH2',
    async getProviderClass() {
      return (
        await import('altair-graphql-core/build/authorization/providers/oauth2')
      ).default;
    },
  },
};
