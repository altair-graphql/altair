import { Action } from '@ngrx/store';

import * as headers from '../../actions/headers/headers';

export interface Header {
    key: string;
    value: string;
}

export interface State extends Array<Header> {
    [index: number]: Header;
}

const initialState: State = [
    { key: '', value: '' },
    { key: '', value: '' },
    { key: '', value: '' },
];

export function headerReducer(state = initialState, action: headers.Action): State {
    switch (action.type) {
        case headers.ADD_HEADER:
            const { key, value } = action;
            return [
                ...state,
                { key, value }
            ];
        case headers.EDIT_HEADER_KEY:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { key: action.payload.val, value: val.value };
                }
                return val;
            });
        case headers.EDIT_HEADER_VALUE:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { key: val.key, value: action.payload.val };
                }
                return val;
            });
        case headers.REMOVE_HEADER:
            return state.filter((val, i) => {
                return i !== action.payload;
            });
        default:
            return state;
    }
}
