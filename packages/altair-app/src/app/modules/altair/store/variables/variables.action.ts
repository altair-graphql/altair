import { Action as NGRXAction } from '@ngrx/store';

export const UPDATE_VARIABLES = 'UPDATE_VARIABLES';

export const ADD_FILE_VARIABLE = 'ADD_FILE_VARIABLE';
export const DELETE_FILE_VARIABLE = 'DELETE_FILE_VARIABLE';

export const UPDATE_FILE_VARIABLE_NAME = 'UPDATE_FILE_VARIABLE_NAME';
export const UPDATE_FILE_VARIABLE_IS_MULTIPLE = 'UPDATE_FILE_VARIABLE_IS_MULTIPLE';
export const UPDATE_FILE_VARIABLE_DATA = 'UPDATE_FILE_VARIABLE_DATA';

export class UpdateVariablesAction implements NGRXAction {
    readonly type = UPDATE_VARIABLES;

    constructor(public payload: string, public windowId: string) {}
}

export class AddFileVariableAction implements NGRXAction {
    readonly type = ADD_FILE_VARIABLE;

    constructor(public windowId: string, public payload?: any) {}
}

export class DeleteFileVariableAction implements NGRXAction {
    readonly type = DELETE_FILE_VARIABLE;

    constructor(public windowId: string, public payload: { index: number }) {}
}

export class UpdateFileVariableNameAction implements NGRXAction {
    readonly type = UPDATE_FILE_VARIABLE_NAME;

    constructor(public windowId: string, public payload: { index: number, name: string }) {}
}

export class UpdateFileVariableIsMultipleAction implements NGRXAction {
    readonly type = UPDATE_FILE_VARIABLE_IS_MULTIPLE;

    constructor(public windowId: string, public payload: { index: number, isMultiple: boolean }) {}
}

export class UpdateFileVariableDataAction implements NGRXAction {
    readonly type = UPDATE_FILE_VARIABLE_DATA;

    constructor(public windowId: string, public payload: { index: number, fileData: File[], fromCache?: boolean }) {}
}

export type Action =
    | UpdateVariablesAction
    | AddFileVariableAction
    | DeleteFileVariableAction
    | UpdateFileVariableNameAction
    | UpdateFileVariableIsMultipleAction
    | UpdateFileVariableDataAction
    ;
