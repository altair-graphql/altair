import { discriminatedUnion, literal, output, undefined } from 'zod/v4';
import { baseAuthorizationProviderInputSchema } from './authorization-provider';
import { apiKeyAuthorizationProviderInputSchema } from './providers/api-key';
import { basicAuthorizationProviderInputSchema } from './providers/basic';
import { bearerAuthorizationProviderInputSchema } from './providers/bearer';
import { oAuth2AuthorizationProviderInputSchema } from './providers/oauth2';

const noneAuthorizationProviderInputSchema =
  baseAuthorizationProviderInputSchema.extend({
    type: literal('none'),
    data: undefined(),
  });

export const authorizationProviderInputSchemas = discriminatedUnion('type', [
  noneAuthorizationProviderInputSchema,
  apiKeyAuthorizationProviderInputSchema,
  basicAuthorizationProviderInputSchema,
  bearerAuthorizationProviderInputSchema,
  oAuth2AuthorizationProviderInputSchema,
]);

export type AuthorizationProviderInput = output<
  typeof authorizationProviderInputSchemas
>;
