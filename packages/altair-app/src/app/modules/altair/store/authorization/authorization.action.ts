import { Action as NGRXAction } from '@ngrx/store';
import { AuthorizationTypes } from 'altair-graphql-core/build/types/state/authorization.interface';

export const SELECT_AUTHORIZATION_TYPE = 'SELECT_AUTHORIZATION_TYPE';
export const UPDATE_AUTHORIZATION_DATA = 'UPDATE_AUTHORIZATION_DATA';

export class SelectAuthorizationTypeAction implements NGRXAction {
  readonly type = SELECT_AUTHORIZATION_TYPE;

  constructor(
    public windowId: string,
    public payload: { type: AuthorizationTypes }
  ) {}
}

export class UpdateAuthorizationDataAction implements NGRXAction {
  readonly type = UPDATE_AUTHORIZATION_DATA;

  constructor(
    public windowId: string,
    public payload: { data: unknown }
  ) {}
}

export type Action = SelectAuthorizationTypeAction | UpdateAuthorizationDataAction;
