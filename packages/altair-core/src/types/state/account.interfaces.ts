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

interface Plan {
  id: string;
  maxQueriesCount: number;
  maxTeamsCount: number;
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
  plan?: Plan;
}

export class TeamId extends ValueObject<string> {}
