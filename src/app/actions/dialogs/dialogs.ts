import { Action } from '@ngrx/store';

export const TOGGLE_HEADER_DIALOG = 'TOGGLE_HEADER_DIALOG';
export const TOGGLE_VARIABLE_DIALOG = 'TOGGLE_VARIABLE_DIALOG';

export class ToggleHeaderDialogAction implements Action {
    readonly type = TOGGLE_HEADER_DIALOG;
}

export class ToggleVariableDialogAction implements Action {
    readonly type = TOGGLE_VARIABLE_DIALOG;
}
