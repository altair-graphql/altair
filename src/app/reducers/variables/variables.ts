import { Action } from '@ngrx/store';

import * as variables from '../../actions/variables/variables';

export interface Variable {
    key: string;
    value: string;
}

export interface State extends Array<Variable> {
    [index: number]: Variable;
}

const initialState: State = [
    { key: '', value: '' }
];

export function variableReducer(state = initialState, action: variables.Action): State {
    switch (action.type) {
        case variables.ADD_VARIABLE:
            return [
                ...state,
                { key: '', value: '' }
            ];
        case variables.EDIT_VARIABLE_KEY:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { key: action.payload.val, value: val.value };
                }
                return val;
            });
        case variables.EDIT_VARIABLE_VALUE:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { key: val.key, value: action.payload.val };
                }
                return val;
            });
        case variables.REMOVE_VARIABLE:
            return state.filter((val, i) => {
                return i !== action.payload;
            });
        default:
            return state;
    }
}
