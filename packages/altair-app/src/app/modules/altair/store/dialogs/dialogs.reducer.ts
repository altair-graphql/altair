import { DialogState } from 'altair-graphql-core/build/types/state/dialog.interfaces';
import * as dialogs from '../../store/dialogs/dialogs.action';
import { AllActions } from '../action';

export const getInitialState = (): DialogState => {
  return {
    showHeaderDialog: false,
    showVariableDialog: false,
    showSubscriptionUrlDialog: false,
    showHistoryDialog: false,
    showPreRequestDialog: false,
  };
};

export function dialogReducer(
  state = getInitialState(),
  action: AllActions
): DialogState {
  switch (action.type) {
    case dialogs.TOGGLE_HEADER_DIALOG:
      return Object.assign({}, state, {
        showHeaderDialog: !state.showHeaderDialog,
      });
    case dialogs.TOGGLE_VARIABLE_DIALOG:
      return Object.assign({}, state, {
        showVariableDialog: !state.showVariableDialog,
      });
    case dialogs.TOGGLE_SUBSCRIPTION_URL_DIALOG:
      return Object.assign({}, state, {
        showSubscriptionUrlDialog: !state.showSubscriptionUrlDialog,
      });
    case dialogs.TOGGLE_HISTORY_DIALOG:
      return { ...state, showHistoryDialog: !state.showHistoryDialog };
    case dialogs.TOGGLE_PRE_REQUEST_DIALOG:
      return { ...state, showPreRequestDialog: !state.showPreRequestDialog };
    default:
      return state;
  }
}
