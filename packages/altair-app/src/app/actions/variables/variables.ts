import { Action } from '@ngrx/store';

export const UPDATE_VARIABLES = 'UPDATE_VARIABLES';

export const ADD_FILE_VARIABLE = 'ADD_FILE_VARIABLE';
export const DELETE_FILE_VARIABLE = 'DELETE_FILE_VARIABLE';

export const UPDATE_FILE_VARIABLE_NAME = 'UPDATE_FILE_VARIABLE_NAME';
export const UPDATE_FILE_VARIABLE_DATA = 'UPDATE_FILE_VARIABLE_DATA';

export class UpdateVariablesAction implements Action {
    readonly type = UPDATE_VARIABLES;

    constructor(public payload: string, public windowId: string) {}
}

export class AddFileVariableAction implements Action {
    readonly type = ADD_FILE_VARIABLE;

    constructor(public windowId: string, public payload?: any) {}
}

export class DeleteFileVariableAction implements Action {
    readonly type = DELETE_FILE_VARIABLE;

    constructor(public windowId: string, public payload: { index: number }) {}
}

export class UpdateFileVariableNameAction implements Action {
    readonly type = UPDATE_FILE_VARIABLE_NAME;

    constructor(public windowId: string, public payload: { index: number, name: string }) {}
}

export class UpdateFileVariableDataAction implements Action {
    readonly type = UPDATE_FILE_VARIABLE_DATA;

    constructor(public windowId: string, public payload: { index: number, fileData: File }) {}
}

export type Action =
    | UpdateVariablesAction
    | AddFileVariableAction
    | DeleteFileVariableAction
    | UpdateFileVariableNameAction
    | UpdateFileVariableDataAction
    ;
