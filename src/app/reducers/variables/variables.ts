import { Action } from '@ngrx/store';

import * as variables from '../../actions/variables/variables';

export interface State{
    variables: string;
}

const initialState: State = {
    variables: '{}'
};

export function variableReducer(state = initialState, action: variables.Action): State {
    switch (action.type) {
        case variables.UPDATE_VARIABLES:
            return Object.assign({}, state, { variables: action.payload });
        default:
            return state;
    }
}
