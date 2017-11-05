import { Action } from '@ngrx/store';

export const SET_URL = 'SET_URL';
export const SET_URL_FROM_DB = 'SET_URL_FROM_DB';
export const SEND_INTROSPECTION_QUERY_REQUEST = 'SEND_INTROSPECTION_QUERY_REQUEST';

export const SET_QUERY = 'SET_QUERY';
export const SET_QUERY_FROM_DB = 'SET_QUERY_FROM_DB';

export const SET_QUERY_RESULT = 'SET_QUERY_RESULT';
export const PRETTIFY_QUERY = 'PRETTIFY_QUERY';
export const SEND_QUERY_REQUEST = 'SEND_QUERY_REQUEST';
export const CANCEL_QUERY_REQUEST = 'CANCEL_QUERY_REQUEST';
export const SET_RESPONSE_STATS = 'SET_RESPONSE_STATS';

export const HIDE_URL_ALERT = 'HIDE_URL_ALERT';
export const SHOW_URL_ALERT = 'SHOW_URL_ALERT';
export const HIDE_EDITOR_ALERT = 'HIDE_EDITOR_ALERT';
export const SHOW_EDITOR_ALERT = 'SHOW_EDITOR_ALERT';

export class SetUrlAction implements Action {
    readonly type = SET_URL;

    constructor(public payload: string, public windowId: string) {}
}

export class SetUrlFromDbAction implements Action {
    readonly type = SET_URL_FROM_DB;

    constructor(public payload: string, public windowId: string) {}
}

export class SendIntrospectionQueryRequestAction implements Action {
    readonly type = SEND_INTROSPECTION_QUERY_REQUEST;

    constructor(public windowId: string, public payload?) {}
}

export class SetQueryAction implements Action {
    readonly type = SET_QUERY;

    constructor(public payload: string, public windowId: string) {}
}

export class SetQueryFromDbAction implements Action {
    readonly type = SET_QUERY_FROM_DB;

    constructor(public payload: string, public windowId: string) {}
}

export class SetQueryResultAction implements Action {
    readonly type = SET_QUERY_RESULT;

    constructor(public payload: any, public windowId: string) {}
}

export class PrettifyQueryAction implements Action {
    readonly type = PRETTIFY_QUERY;

    constructor(public windowId: string, public payload?) {}
}

export class SendQueryRequestAction implements Action {
    readonly type = SEND_QUERY_REQUEST;

    constructor(public windowId: string, public payload?) {}
}

export class SetResponseStatsAction implements Action {
    readonly type = SET_RESPONSE_STATS;

    constructor(public windowId: string, public payload: { responseTime: number, responseStatus: number, responseStatusText: string }) {}
}

export class CancelQueryRequestAction implements Action {
    readonly type = CANCEL_QUERY_REQUEST;

    constructor(public windowId: string, public payload?) {}
}

export class HideUrlAlertAction implements Action {
    readonly type = HIDE_URL_ALERT;

    constructor(public windowId: string, public payload?) {}
}

export class ShowUrlAlertAction implements Action {
    readonly type = SHOW_URL_ALERT;

    constructor(public payload: any, public windowId: string) {}
}

export class HideEditorAlertAction implements Action {
    readonly type = HIDE_EDITOR_ALERT;

    constructor(public windowId: string, public payload?) {}
}

export class ShowEditorAlertAction implements Action {
    readonly type = SHOW_EDITOR_ALERT;

    constructor(public payload: any, public windowId: string) {}
}

export type Action =
    SetUrlAction |
    SetUrlFromDbAction |
    SendIntrospectionQueryRequestAction |
    SetQueryAction |
    SetQueryFromDbAction |
    SetQueryResultAction |
    PrettifyQueryAction |
    SendQueryRequestAction |
    SetResponseStatsAction |
    CancelQueryRequestAction |
    HideUrlAlertAction |
    ShowUrlAlertAction |
    HideEditorAlertAction |
    ShowEditorAlertAction;
