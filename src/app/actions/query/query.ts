import { Action } from '@ngrx/store';

export const SET_URL = 'SET_URL';
export const SET_QUERY = 'SET_QUERY';
export const SET_QUERY_RESULT = 'SET_QUERY_RESULT';
export const PRETTIFY_QUERY = 'PRETTIFY_QUERY';
export const SEND_QUERY_REQUEST = 'SEND_QUERY_REQUEST';

export class SetUrlAction implements Action {
    readonly type = SET_URL;

    constructor(public payload: string) {}
}

export class SetQueryAction implements Action {
    readonly type = SET_QUERY;

    constructor(public payload: string) {}
}

export class SetQueryResultAction implements Action {
    readonly type = SET_QUERY_RESULT;

    constructor(public payload: any) {}
}

export class PrettifyQueryAction implements Action {
    readonly type = PRETTIFY_QUERY;
}

export class SendQueryRequestAction implements Action {
    readonly type = SEND_QUERY_REQUEST;
}
