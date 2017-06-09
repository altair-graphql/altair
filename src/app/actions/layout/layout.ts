import { Action } from '@ngrx/store';

export const START_LOADING = 'START_LOADING';
export const STOP_LOADING = 'STOP_LOADING';

export class StartLoadingAction implements Action {
    readonly type = START_LOADING;

    constructor(public windowId: string) {}
}

export class StopLoadingAction implements Action {
    readonly type = STOP_LOADING;

    constructor(public windowId: string) {}
}
