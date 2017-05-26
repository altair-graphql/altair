import { Action } from '@ngrx/store';

import * as dialogs from '../../actions/dialogs/dialogs';

export interface Variable {
    key: string;
    value: string;
}

export interface State {
    showHeaderDialog: boolean;
    showVariableDialog: boolean;
}

const initialState: State = {
    showHeaderDialog: false,
    showVariableDialog: false
};

export function dialogReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case dialogs.TOGGLE_HEADER_DIALOG:
            return Object.assign({}, state, { showHeaderDialog: !state.showHeaderDialog });
        case dialogs.TOGGLE_VARIABLE_DIALOG:
            return Object.assign({}, state, { showVariableDialog: !state.showVariableDialog });
        default:
            return state;
    }
}