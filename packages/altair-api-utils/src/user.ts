export {
  IPlanInfo,
  IPlan,
} from 'altair-graphql-core/build/types/state/account.interfaces';
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
  isNewUser?: boolean;
  tokens: IToken;
}

export interface IUserStats {
  queries: {
    own: number;
    access: number;
  };
  collections: {
    own: number;
    access: number;
  };
  teams: {
    own: number;
    access: number;
  };
}
