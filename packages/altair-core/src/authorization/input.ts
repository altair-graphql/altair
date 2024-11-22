import { ApiKeyAuthorizationProviderInput } from './providers/api-key';
import { BasicAuthorizationProviderInput } from './providers/basic';
import { BearerAuthorizationProviderInput } from './providers/bearer';
import { OAuth2AuthorizationProviderInput } from './providers/oauth2';

interface NoneAuthorizationProviderInput {
  type: 'none';
  data?: undefined;
}

export type AuthorizationProviderInput =
  | NoneAuthorizationProviderInput
  | ApiKeyAuthorizationProviderInput
  | BasicAuthorizationProviderInput
  | BearerAuthorizationProviderInput
  | OAuth2AuthorizationProviderInput;
