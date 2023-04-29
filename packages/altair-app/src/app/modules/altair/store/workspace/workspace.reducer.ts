import { WorkspacesState } from 'altair-graphql-core/build/types/state/workspace.interface';
import { AllActions } from '../action';

import * as workspaceActions from './workspace.action';

export const getInitialState = (): WorkspacesState => {
  return {
    list: [],
  };
};

export function workspaceReducer(
  state = getInitialState(),
  action: AllActions
): WorkspacesState {
  switch (action.type) {
    case workspaceActions.SET_WORKSPACES:
      return { ...state, list: action.payload };
    default:
      return state;
  }
}
