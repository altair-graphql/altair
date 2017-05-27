import { Action } from '@ngrx/store';

export const ADD_HEADER = 'ADD_HEADER';
export const REMOVE_HEADER = 'REMOVE_HEADER';
export const EDIT_HEADER_KEY = 'EDIT_HEADER_KEY';
export const EDIT_HEADER_VALUE = 'EDIT_HEADER_VALUE';

export class AddHeaderAction implements Action {
    readonly type = ADD_HEADER;

    constructor(public key: string = '', public value: string = '') {}
}

export class RemoveHeaderAction implements Action {
    readonly type = REMOVE_HEADER;

    constructor(public payload: number) {}
}

export class EditHeaderKeyAction implements Action {
    readonly type = EDIT_HEADER_KEY;

    constructor(public payload: any) {}
}

export class EditHeaderValueAction implements Action {
    readonly type = EDIT_HEADER_VALUE;

    constructor(public payload: any) {}
}

export type Action = AddHeaderAction | RemoveHeaderAction | EditHeaderKeyAction | EditHeaderValueAction;
