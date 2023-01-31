import { Team } from '@prisma/client';
import { ValueObject } from '../../utils/value-object';

export interface AccountState {
  loggedIn: boolean;
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  teams: Team[];
}

export { Team } from '@prisma/client';
export class TeamId extends ValueObject<string> {}
