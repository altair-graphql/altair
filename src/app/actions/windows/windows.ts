import { Action } from '@ngrx/store';

import * as fromWindows from '../../reducers/windows';

export const ADD_WINDOW = 'ADD_WINDOW';
export const SET_WINDOWS = 'SET_WINDOWS';
export const REMOVE_WINDOW = 'REMOVE_WINDOW';

export class AddWindowAction implements Action {
    readonly type = ADD_WINDOW;

    constructor(public payload: any) {}
}
export class SetWindowsAction implements Action {
    readonly type = SET_WINDOWS;

    constructor(public payload: Array<any>) {}
}

export class RemoveWindowAction implements Action {
    readonly type = REMOVE_WINDOW;

    constructor(public windowId: string) {}
}

export type Action = AddWindowAction | SetWindowsAction | RemoveWindowAction;
