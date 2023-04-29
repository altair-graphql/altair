import { Action as NGRXAction } from '@ngrx/store';
import {
  AccountState,
  Team,
} from 'altair-graphql-core/build/types/state/account.interfaces';

export const LOGIN_ACCOUNT = 'LOGIN_ACCOUNT';
export const ACCOUNT_IS_LOGGED_IN = 'ACCOUNT_IS_LOGGED_IN';
export const LOGOUT_ACCOUNT = 'LOGOUT_ACCOUNT';
export const ACCOUNT_LOGGED_OUT = 'ACCOUNT_LOGGED_OUT';
export const LOAD_TEAMS = 'LOAD_TEAMS';
export const SET_TEAMS = 'SET_TEAMS';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';

export class LoginAccountAction implements NGRXAction {
  readonly type = LOGIN_ACCOUNT;
}

export class AccountIsLoggedInAction implements NGRXAction {
  readonly type = ACCOUNT_IS_LOGGED_IN;

  constructor(
    public payload: {
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    }
  ) {}
}

export class LogoutAccountAction implements NGRXAction {
  readonly type = LOGOUT_ACCOUNT;
}

export class AccountLoggedOutAction implements NGRXAction {
  readonly type = ACCOUNT_LOGGED_OUT;
}

export class LoadTeamsAction implements NGRXAction {
  readonly type = LOAD_TEAMS;
}

export class SetTeamsAction implements NGRXAction {
  readonly type = SET_TEAMS;

  constructor(public payload: { teams: Team[] }) {}
}

export class UpdateAccountAction implements NGRXAction {
  readonly type = UPDATE_ACCOUNT;

  constructor(public payload: Partial<AccountState>) {}
}

export type Action =
  | LoginAccountAction
  | AccountIsLoggedInAction
  | LogoutAccountAction
  | AccountLoggedOutAction
  | LoadTeamsAction
  | SetTeamsAction
  | UpdateAccountAction;
