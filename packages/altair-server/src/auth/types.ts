export interface JwtPayload {
  username: string;
  sub: string;
  // https://community.auth0.com/t/can-i-add-email-address-to-the-access-token-when-calling-an-api/70163
  'https://altairgraphql.io/email': string;
  'https://altairgraphql.io/email_verified': boolean;
  'https://altairgraphql.io/given_name'?: string;
  'https://altairgraphql.io/family_name'?: string;
  'https://altairgraphql.io/name'?: string;
}

export interface RequestUser {
  id?: string;
  auth0Id?: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  name?: string;
}
