import { Action as NGRXAction } from '@ngrx/store';

export const LOGIN_ACCOUNT = 'LOGIN_ACCOUNT';
export const ACCOUNT_IS_LOGGED_IN = 'ACCOUNT_IS_LOGGED_IN';

export class LoginAccountAction implements NGRXAction {
  readonly type = LOGIN_ACCOUNT;
}

export class AccountIsLoggedInAction implements NGRXAction {
  readonly type = ACCOUNT_IS_LOGGED_IN;

  constructor(public payload: {
    email: string;
    firstName: string;
    lastName: string;
  }) {}
}

export type Action =
  | LoginAccountAction
  | AccountIsLoggedInAction
  ;
