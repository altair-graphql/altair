import { AccountState } from 'altair-graphql-core/build/types/state/account.interfaces';

import * as account from '../../store/account/account.action';

export const getInitialState = (): AccountState => {
  return {
    loggedIn: false,
    accessToken: '',
    email: '',
    firstName: '',
    lastName: '',
    teams: [],
  };
};

export function accountReducer(
  state = getInitialState(),
  action: account.Action
): AccountState {
  switch (action.type) {
    case account.ACCOUNT_IS_LOGGED_IN:
      const payload = action.payload;
      return {
        ...state,
        loggedIn: true,
        ...payload,
      };
    case account.ACCOUNT_LOGGED_OUT:
      return getInitialState();
    case account.SET_TEAMS:
      return {
        ...state,
        teams: action.payload.teams,
      };
    default:
      return state;
  }
}
