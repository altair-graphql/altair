import { Action } from '@ngrx/store';

import * as environmentsAction from '../actions/environments/environments';

export interface EnvironmentState {
  // Adding undefined for backward compatibility
  id?: string;
  title: string;
  variablesJson: string;
}

export interface State {
  base: EnvironmentState;
  subEnvironments: EnvironmentState[];
  // Adding undefined for backward compatibility
  activeSubEnvironment?: string;
}

export const getInitialEnvironmentState = (): EnvironmentState => {
  return {
    title: 'Environment',
    variablesJson: '{}'
  };
};

export const getInitialState = (): State => {
  return {
    base: { ...getInitialEnvironmentState() },
    subEnvironments: [],
  }
};

export function environmentsReducer(state = getInitialState(), action: environmentsAction.Action): State {
  switch (action.type) {
    case environmentsAction.ADD_SUB_ENVIRONMENT:
      return {
        ...state,
        subEnvironments: [
          ...state.subEnvironments,
          {
            ...getInitialEnvironmentState(),
            id: action.payload.id,
            title: `Environment ${state.subEnvironments.length + 1}`
          }
        ]
      };
    case environmentsAction.DELETE_SUB_ENVIRONMENT: {
      return { ...state, subEnvironments: state.subEnvironments.filter(env => env.id !== action.payload.id) };
    }
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
