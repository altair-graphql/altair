import { Action } from '@ngrx/store';

import { initialQuery } from './initialQuery';

import * as query from '../../actions/query/query';

export interface State {
    url: string;
    query: string;
    response: any;
}

const initialState: State = {
    url: '',
    query: initialQuery,
    response: null
};

export function queryReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case query.SET_QUERY:
            return Object.assign({}, state, { query: action.payload });
        case query.SET_URL:
            return Object.assign({}, state, { url: action.payload });
        case query.SET_QUERY_RESULT:
            return Object.assign({}, state, { response: action.payload });
        default:
            return state;
    }
}
