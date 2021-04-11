import { Action as NGRXAction } from '@ngrx/store';

export const ADD_SUB_ENVIRONMENT = 'ADD_SUB_ENVIRONMENT';
export const DELETE_SUB_ENVIRONMENT = 'DELETE_SUB_ENVIRONMENT';

export const UPDATE_BASE_ENVIRONMENT_JSON = 'UPDATE_BASE_ENVIRONMENT_JSON';
export const UPDATE_SUB_ENVIRONMENT_JSON = 'UPDATE_SUB_ENVIRONMENT_JSON';
export const UPDATE_SUB_ENVIRONMENT_TITLE = 'UPDATE_SUB_ENVIRONMENT_TITLE';

export const SELECT_ACTIVE_SUB_ENVIRONMENT = 'SELECT_ACTIVE_SUB_ENVIRONMENT';
export const REPOSITION_SUB_ENVIRONMENT = 'REPOSITION_SUB_ENVIRONMENT';

export class AddSubEnvironmentAction implements NGRXAction {
  readonly type = ADD_SUB_ENVIRONMENT;

  constructor(public payload: { id: string }) {}
}

export class DeleteSubEnvironmentAction implements NGRXAction {
  readonly type = DELETE_SUB_ENVIRONMENT;

  constructor(public payload: { id: string }) {}
}

export class UpdateBaseEnvironmentJsonAction implements NGRXAction {
  readonly type = UPDATE_BASE_ENVIRONMENT_JSON;

  constructor(public payload: { value: string }) {}
}

export class UpdateSubEnvironmentJsonAction implements NGRXAction {
  readonly type = UPDATE_SUB_ENVIRONMENT_JSON;

  constructor(public payload: { id: string, value: string }) {}
}

export class UpdateSubEnvironmentTitleAction implements NGRXAction {
  readonly type = UPDATE_SUB_ENVIRONMENT_TITLE;

  constructor(public payload: { id: string, value: string }) {}
}

export class SelectActiveSubEnvironmentAction implements NGRXAction {
  readonly type = SELECT_ACTIVE_SUB_ENVIRONMENT;

  constructor(public payload: { id?: string }) {}
}

export class RepositionSubEnvironmentAction implements NGRXAction {
  readonly type = REPOSITION_SUB_ENVIRONMENT;

  constructor(public payload: { currentPosition: number, newPosition: number }) {}
}

export type Action =
  | AddSubEnvironmentAction
  | DeleteSubEnvironmentAction
  | UpdateBaseEnvironmentJsonAction
  | UpdateSubEnvironmentJsonAction
  | UpdateSubEnvironmentTitleAction
  | SelectActiveSubEnvironmentAction
  | RepositionSubEnvironmentAction
  ;
