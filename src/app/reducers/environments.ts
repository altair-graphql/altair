import { Action } from '@ngrx/store';

import * as environmentsAction from '../actions/environments/environments';

export interface EnvironmentState {
  id: string;
  title: string;
  variablesJson: string;
}

export interface State {
  base: EnvironmentState;
  subEnvironments: EnvironmentState[];
  activeSubEnvironment: string;
}

export const initialEnvironmentState: EnvironmentState = {
  id: null,
  title: 'Environment',
  variablesJson: '{}'
};

export const initialState: State = {
  base: { ...initialEnvironmentState },
  subEnvironments: [],
  activeSubEnvironment: null
};

export function environmentsReducer(state = initialState, action: environmentsAction.Action): State {
  switch (action.type) {
    case environmentsAction.ADD_SUB_ENVIRONMENT:
      return {
        ...state,
        subEnvironments: [
          ...state.subEnvironments,
          {
            ...initialEnvironmentState,
            id: action.payload.id,
            title: `Environment ${state.subEnvironments.length + 1}`
          }
        ]
      };
    case environmentsAction.UPDATE_BASE_ENVIRONMENT_JSON:
      const base = state.base;
      base.variablesJson = action.payload.value;
      return { ...state, base };
    case environmentsAction.UPDATE_SUB_ENVIRONMENT_JSON: {
      const subEnvironments = state.subEnvironments.map(env => {
        if (env.id === action.payload.id) {
          env.variablesJson = action.payload.value;
        }
        return env;
      });
      return { ...state, subEnvironments };
    }
    case environmentsAction.UPDATE_SUB_ENVIRONMENT_TITLE: {
      const subEnvironments = state.subEnvironments.map(env => {
        if (env.id === action.payload.id) {
          env.title = action.payload.value;
        }
        return env;
      });
      return { ...state, subEnvironments };
    }
    case environmentsAction.SELECT_ACTIVE_SUB_ENVIRONMENT: {
      return { ...state, activeSubEnvironment: action.payload.id };
    }
    default:
      return state;
  }
}
