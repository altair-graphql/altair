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
  canUpgradePro: boolean;
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

export interface IAvailableCredits {
  fixed: number;
  monthly: number;
  total: number;
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
  availableCredits?: IAvailableCredits;
}

export class TeamId extends ValueObject<string> {}
