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

export interface IPlan {
  id: string;
  max_query_count: number;
  max_team_count: number;
  max_team_member_count: number;
}

export interface IPlanInfo {
  id: string;
  price_id: string;
  role: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
}
