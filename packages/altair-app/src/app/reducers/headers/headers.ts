import { Action } from '@ngrx/store';

import * as headers from '../../actions/headers/headers';
import { getAltairConfig } from 'app/config';

export const getInitialHeadersState = () => {
    const altairConfig = getAltairConfig();
    let initialHeaders: State = [];
    if (altairConfig.initialData.headers) {
        initialHeaders = Object.keys(altairConfig.initialData.headers).map(key => ({
            key,
            value: altairConfig.initialData.headers[key] ? '' + altairConfig.initialData.headers[key] : ''
        }));
    }
    initialHeaders = [ ...initialHeaders, { key: '', value: '' } ];

    return initialHeaders;
};

export interface Header {
    key: string;
    value: string;
}

export interface State extends Array<Header> {
    [index: number]: Header;
}

export function headerReducer(state = getInitialHeadersState(), action: headers.Action): State {
    switch (action.type) {
        case headers.ADD_HEADER:
            return [
                ...state,
                { key: '', value: '' }
            ];
        case headers.SET_HEADERS:
            return [ ...action.payload.headers ];
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
