import { Action as NGRXAction } from '@ngrx/store';

export const SHOW_DONATION_ALERT = 'SHOW_DONATION_ALERT';
export const HIDE_DONATION_ALERT = 'HIDE_DONATION_ALERT';

export class ShowDonationAlertAction implements NGRXAction {
  readonly type = SHOW_DONATION_ALERT;
}

export class HideDonationAlertAction implements NGRXAction {
  readonly type = HIDE_DONATION_ALERT;
}

export type Action =
  | ShowDonationAlertAction
  | HideDonationAlertAction;
