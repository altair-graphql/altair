import { Action } from '@ngrx/store';

import { initialQuery } from './initialQuery';

import * as query from '../../actions/query/query';

export interface State {
    url: string;
    query: string;
    response: any;
    showUrlAlert: boolean;
}

const initialState: State = {
    url: '',
    query: initialQuery,
    response: null,
    showUrlAlert: false
};

export function queryReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case query.SET_QUERY:
        case query.SET_QUERY_FROM_DB:
            return Object.assign({}, state, { query: action.payload });
        case query.SET_URL:
        case query.SET_URL_FROM_DB:
            return Object.assign({}, state, { url: action.payload });
        case query.SET_QUERY_RESULT:
            return Object.assign({}, state, { response: action.payload });
        case query.SHOW_URL_ALERT:
            return Object.assign({}, state, { showUrlAlert: true });
        case query.HIDE_URL_ALERT:
            return Object.assign({}, state, { showUrlAlert: false });
        default:
            return state;
    }
}
