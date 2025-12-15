import { v4 as uuid } from 'uuid';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import {
  EnvironmentsState,
  BaseEnvironmentState,
  EnvironmentState,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import * as environmentsAction from './environments.action';
import { AllActions } from '../action';

export const getInitialBaseEnvironmentState = (): BaseEnvironmentState => {
  const {
    options: { initialEnvironments },
  } = getAltairConfig();

  return {
    variablesJson: JSON.stringify(
      (initialEnvironments.base && initialEnvironments.base.variables) || {}
    ),
  };
};
export const getInitialEnvironmentState = (): EnvironmentState => {
  const {
    options: { initialEnvironments },
  } = getAltairConfig();

  return {
    title:
      (initialEnvironments.base && initialEnvironments.base.title) || 'Environment',
    variablesJson: JSON.stringify(
      (initialEnvironments.base && initialEnvironments.base.variables) || {}
    ),
  };
};

const getInitialSubEnvironmentState = (): EnvironmentState[] => {
  const {
    options: { initialEnvironments },
  } = getAltairConfig();

  return (initialEnvironments.subEnvironments || []).map((env, idx) => {
    return {
      id: env.id || uuid(),
      title: env.title || `Environment ${idx + 1}`,
      variablesJson: JSON.stringify(env.variables || {}),
    };
  });
};

const getInitialActiveSubEnvironment = (): string | undefined => {
  const {
    options: { initialEnvironments },
  } = getAltairConfig();
  return initialEnvironments.activeSubEnvironment;
};

export const getInitialState = (): EnvironmentsState => {
  return {
    base: getInitialBaseEnvironmentState(),
    subEnvironments: getInitialSubEnvironmentState(),
    activeSubEnvironment: getInitialActiveSubEnvironment(),
  };
};

export function environmentsReducer(
  state = getInitialState(),
  action: AllActions
): EnvironmentsState {
  switch (action.type) {
    case environmentsAction.ADD_SUB_ENVIRONMENT:
      return {
        ...state,
        subEnvironments: [
          ...state.subEnvironments,
          {
            ...getInitialEnvironmentState(),
            id: action.payload.id,
            title:
              action.payload.title ??
              `Environment ${state.subEnvironments.length + 1}`,
            variablesJson: JSON.stringify(action.payload.variables ?? {}, null, 2),
          },
        ],
      };
    case environmentsAction.DELETE_SUB_ENVIRONMENT: {
      return {
        ...state,
        subEnvironments: state.subEnvironments.filter(
          (env) => env.id !== action.payload.id
        ),
      };
    }
    case environmentsAction.UPDATE_BASE_ENVIRONMENT_JSON: {
      const base = state.base;
      base.variablesJson = action.payload.value;
      return { ...state, base };
    }
    case environmentsAction.UPDATE_SUB_ENVIRONMENT_JSON: {
      const subEnvironments = state.subEnvironments.map((env) => {
        if (env.id === action.payload.id) {
          env.variablesJson = action.payload.value;
        }
        return env;
      });
      return { ...state, subEnvironments };
    }
    case environmentsAction.UPDATE_SUB_ENVIRONMENT_TITLE: {
      const subEnvironments = state.subEnvironments.map((env) => {
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
    case environmentsAction.REPOSITION_SUB_ENVIRONMENT: {
      const curPos = action.payload.currentPosition;
      const newPos = action.payload.newPosition;

      if (
        curPos > -1 &&
        curPos < state.subEnvironments.length &&
        newPos > -1 &&
        newPos < state.subEnvironments.length
      ) {
        const arr = [...state.subEnvironments];
        arr.splice(newPos, 0, arr.splice(curPos, 1)[0]!);

        return { ...state, subEnvironments: [...arr] };
      }
      return state;
    }
    default:
      return state;
  }
}
