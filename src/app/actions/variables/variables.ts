import { Action } from '@ngrx/store';

export const UPDATE_VARIABLES = 'UPDATE_VARIABLES';

export class UpdateVariablesAction implements Action {
    readonly type = UPDATE_VARIABLES;

    constructor(public payload: string, public windowId: string) {}
}

export type Action = UpdateVariablesAction;
