import { Action as NGRXAction } from '@ngrx/store';

export const LOGIN_ACCOUNT = 'LOGIN_ACCOUNT';
export const ACCOUNT_IS_LOGGED_IN = 'ACCOUNT_IS_LOGGED_IN';
export const LOGOUT_ACCOUNT = 'LOGOUT_ACCOUNT';
export const ACCOUNT_LOGGED_OUT = 'ACCOUNT_LOGGED_OUT';

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
    }
  ) {}
}

export class LogoutAccountAction implements NGRXAction {
  readonly type = LOGOUT_ACCOUNT;
}

export class AccountLoggedOutAction implements NGRXAction {
  readonly type = ACCOUNT_LOGGED_OUT;
}

export type Action =
  | LoginAccountAction
  | AccountIsLoggedInAction
  | LogoutAccountAction
  | AccountLoggedOutAction;
