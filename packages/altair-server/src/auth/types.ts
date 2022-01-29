export interface RequestUser {
  id?: string;
  auth0Id?: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  name?: string;
}
