import { Action } from '@ngrx/store';

import * as donation from '../actions/donation';

export interface State {
  showAlert: boolean;
}

export const initialState: State = {
  showAlert: false
};

export function donationReducer(state = initialState, action: donation.Action): State {
  switch (action.type) {
    case donation.SHOW_DONATION_ALERT:
      return { ...state, showAlert: true };
    case donation.HIDE_DONATION_ALERT:
      return { ...state, showAlert: false };
    default:
      return state;
  }
}
