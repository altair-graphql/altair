import { Action } from '@ngrx/store';

import { initialQuery } from './initialQuery';

import * as query from '../../actions/query/query';

export interface State {
    url: string;
    query: string;
    response: any;
    responseTime: number;
    responseStatus: number;
    responseStatusText: string;
    showUrlAlert: boolean;
    urlAlertMessage: string;
    urlAlertSuccess: boolean;
    showEditorAlert: boolean;
    editorAlertMessage: string;
    editorAlertSuccess: boolean;
}

const initialState: State = {
    url: '',
    query: initialQuery,
    response: null,
    responseTime: 0,
    responseStatus: 0,
    responseStatusText: '',
    showUrlAlert: false,
    urlAlertMessage: 'URL has been set',
    urlAlertSuccess: true,
    showEditorAlert: false,
    editorAlertMessage: 'Query is set',
    editorAlertSuccess: true
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
        case query.SET_RESPONSE_STATS:
            return Object.assign({}, state, {
                responseTime: action.payload.responseTime,
                responseStatus: action.payload.responseStatus,
                responseStatusText: action.payload.responseStatusText
            });
        case query.SHOW_URL_ALERT:
            return Object.assign({}, state, {
                showUrlAlert: true,
                urlAlertMessage: action.payload.message,
                urlAlertSuccess: action.payload.success
            });
        case query.HIDE_URL_ALERT:
            return Object.assign({}, state, { showUrlAlert: false });
        case query.SHOW_EDITOR_ALERT:
            return Object.assign({}, state, {
                showEditorAlert: true,
                editorAlertMessage: action.payload.message,
                editorAlertSuccess: action.payload.success
            });
        case query.HIDE_EDITOR_ALERT:
            return Object.assign({}, state, { showEditorAlert: false });
        default:
            return state;
    }
}
