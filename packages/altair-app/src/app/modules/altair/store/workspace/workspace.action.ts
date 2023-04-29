import { Action as NGRXAction } from '@ngrx/store';
import { Workspace } from 'altair-graphql-core/build/types/state/workspace.interface';

export const LOAD_WORKSPACES = 'LOAD_WORKSPACES';
export const SET_WORKSPACES = 'SET_WORKSPACES';

export class LoadWorkspacesAction implements NGRXAction {
  readonly type = LOAD_WORKSPACES;
}

export class SetWorkspacesAction implements NGRXAction {
  readonly type = SET_WORKSPACES;

  constructor(public payload: Workspace[]) {}
}

export type Action = LoadWorkspacesAction | SetWorkspacesAction;
