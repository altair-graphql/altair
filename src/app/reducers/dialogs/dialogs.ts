import * as dialogs from '../../actions/dialogs/dialogs';

export interface State {
  showHeaderDialog: boolean;
  showVariableDialog: boolean;
  showSubscriptionUrlDialog: boolean;
  showHistoryDialog: boolean;
  showAddToCollectionDialog: boolean;
  showPreRequestDialog: boolean;
}

export const initialState: State = {
  showHeaderDialog: false,
  showVariableDialog: false,
  showSubscriptionUrlDialog: false,
  showHistoryDialog: false,
  showAddToCollectionDialog: false,
  showPreRequestDialog: false,
};

export function dialogReducer(state = initialState, action: dialogs.Action): State {
  switch (action.type) {
    case dialogs.TOGGLE_HEADER_DIALOG:
      return Object.assign({}, state, { showHeaderDialog: !state.showHeaderDialog });
    case dialogs.TOGGLE_VARIABLE_DIALOG:
      return Object.assign({}, state, { showVariableDialog: !state.showVariableDialog });
    case dialogs.TOGGLE_SUBSCRIPTION_URL_DIALOG:
      return Object.assign({}, state, { showSubscriptionUrlDialog: !state.showSubscriptionUrlDialog });
    case dialogs.TOGGLE_HISTORY_DIALOG:
      return { ...state, showHistoryDialog: !state.showHistoryDialog };
    case dialogs.TOGGLE_ADD_TO_COLLECTION_DIALOG:
      return { ...state, showAddToCollectionDialog: !state.showAddToCollectionDialog };
    case dialogs.TOGGLE_PRE_REQUEST_DIALOG:
      return { ...state, showPreRequestDialog: !state.showPreRequestDialog };
    default:
      return state;
  }
}
