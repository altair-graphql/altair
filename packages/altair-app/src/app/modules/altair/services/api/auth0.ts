import { Auth0Client } from '@auth0/auth0-spa-js';
import { environment } from 'environments/environment';

export const auth0 = new Auth0Client({
  domain: environment.auth0.domain,
  client_id: environment.auth0.client_id,
  audience: environment.auth0.audience,
});
