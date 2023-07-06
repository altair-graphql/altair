import { ValueObject } from '../../utils/value-object';
export interface Team {
  id: string;
  name: string;
  description?: string;
}

interface Stats {
  queriesCount: number;
  queryCollectionsCount: number;
  teamsCount: number;
}

export interface IPlan {
  id: string;
  maxQueriesCount: number;
  maxTeamsCount: number;
  maxTeamMembersCount: number;
}

export interface IPlanInfo {
  id: string;
  priceId: string;
  role: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
}

export interface AccountState {
  loggedIn: boolean;
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  teams: Team[];
  stats?: Stats;
  plan?: IPlan;
  planInfos?: IPlanInfo[];
}

export class TeamId extends ValueObject<string> {}
