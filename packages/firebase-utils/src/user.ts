export interface Token {
  accessToken: string;
  refreshToken: string;
}
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;
  tokens: Token;
}
