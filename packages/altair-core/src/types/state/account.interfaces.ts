import { ValueObject } from '../../utils/value-object';
import { BaseOwnableDocument } from '../shared';

export interface Team extends BaseOwnableDocument {
  name: string;
  description?: string;
}

export interface AccountState {
  loggedIn: boolean;
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  teams: Team[];
}

export class TeamId extends ValueObject<string> {}
