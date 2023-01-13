import { Action } from '@ngrx/store';
import { DonationState } from 'altair-graphql-core/build/types/state/donation.interfaces';
import { AllActions } from '../action';

import * as donation from './donation.action';

export const getInitialState = (): DonationState => {
  return {
    showAlert: false,
  };
};

export function donationReducer(
  state = getInitialState(),
  action: AllActions
): DonationState {
  switch (action.type) {
    case donation.SHOW_DONATION_ALERT:
      return { ...state, showAlert: true };
    case donation.HIDE_DONATION_ALERT:
      return { ...state, showAlert: false };
    default:
      return state;
  }
}
