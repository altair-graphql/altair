export interface IToken {
  accessToken: string;
  refreshToken: string;
}
export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;
  tokens: IToken;
}
