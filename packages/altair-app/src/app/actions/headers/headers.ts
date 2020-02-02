import { Action as NGRXAction } from '@ngrx/store';

import * as fromHeaders from '../../reducers/headers/headers';

export const ADD_HEADER = 'ADD_HEADER';
export const REMOVE_HEADER = 'REMOVE_HEADER';
export const EDIT_HEADER_KEY = 'EDIT_HEADER_KEY';
export const EDIT_HEADER_VALUE = 'EDIT_HEADER_VALUE';
export const SET_HEADERS = 'SET_HEADERS';

export class AddHeaderAction implements NGRXAction {
    readonly type = ADD_HEADER;

    constructor(public windowId: string) {}
}

export class RemoveHeaderAction implements NGRXAction {
    readonly type = REMOVE_HEADER;

    constructor(public payload: number, public windowId: string) {}
}

export class EditHeaderKeyAction implements NGRXAction {
    readonly type = EDIT_HEADER_KEY;

    constructor(public payload: any, public windowId: string) {}
}

export class EditHeaderValueAction implements NGRXAction {
    readonly type = EDIT_HEADER_VALUE;

    constructor(public payload: any, public windowId: string) {}
}

export class SetHeadersAction implements NGRXAction {
  readonly type = SET_HEADERS;

  constructor(public payload: { headers: Array<fromHeaders.Header> }, public windowId: string) { }
}

export type Action = AddHeaderAction | RemoveHeaderAction | EditHeaderKeyAction | EditHeaderValueAction | SetHeadersAction;
