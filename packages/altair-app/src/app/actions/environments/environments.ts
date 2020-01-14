import { Action } from '@ngrx/store';

export const ADD_SUB_ENVIRONMENT = 'ADD_SUB_ENVIRONMENT';
export const DELETE_SUB_ENVIRONMENT = 'DELETE_SUB_ENVIRONMENT';

export const UPDATE_BASE_ENVIRONMENT_JSON = 'UPDATE_BASE_ENVIRONMENT_JSON';
export const UPDATE_SUB_ENVIRONMENT_JSON = 'UPDATE_SUB_ENVIRONMENT_JSON';
export const UPDATE_SUB_ENVIRONMENT_TITLE = 'UPDATE_SUB_ENVIRONMENT_TITLE';

export const SELECT_ACTIVE_SUB_ENVIRONMENT = 'SELECT_ACTIVE_SUB_ENVIRONMENT';

export class AddSubEnvironmentAction implements Action {
  readonly type = ADD_SUB_ENVIRONMENT;

  constructor(public payload: { id: string }) {}
}

export class DeleteSubEnvironmentAction implements Action {
  readonly type = DELETE_SUB_ENVIRONMENT;

  constructor(public payload: { id: string }) {}
}

export class UpdateBaseEnvironmentJsonAction implements Action {
  readonly type = UPDATE_BASE_ENVIRONMENT_JSON;

  constructor(public payload: { value: string }) {}
}

export class UpdateSubEnvironmentJsonAction implements Action {
  readonly type = UPDATE_SUB_ENVIRONMENT_JSON;

  constructor(public payload: { id: string, value: string }) {}
}

export class UpdateSubEnvironmentTitleAction implements Action {
  readonly type = UPDATE_SUB_ENVIRONMENT_TITLE;

  constructor(public payload: { id: string, value: string }) {}
}

export class SelectActiveSubEnvironmentAction implements Action {
  readonly type = SELECT_ACTIVE_SUB_ENVIRONMENT;

  constructor(public payload: { id?: string }) {}
}

export type Action =
  | AddSubEnvironmentAction
  | DeleteSubEnvironmentAction
  | UpdateBaseEnvironmentJsonAction
  | UpdateSubEnvironmentJsonAction
  | UpdateSubEnvironmentTitleAction
  | SelectActiveSubEnvironmentAction
  ;
