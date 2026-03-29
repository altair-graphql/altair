import { Action } from '@ngrx/store';

import * as variables from './variables.action';
import {
  FileVariable,
  VariableState,
} from 'altair-graphql-core/build/types/state/variable.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { v4 as uuid } from 'uuid';
import { AllActions } from '../action';

const initialFileVariableState = (
  name = 'file',
  data: File[] | undefined = undefined,
  isMultiple = false
): FileVariable => ({
  id: uuid(),
  name,
  data,
  isMultiple,
});

export const getInitialState = (): VariableState => {
  const altairConfig = getAltairConfig();
  return {
    variables: altairConfig.options.initialVariables
      ? '' + altairConfig.options.initialVariables
      : '{}',
    files: [],
  };
};

export function variableReducer(
  state = getInitialState(),
  action: AllActions
): VariableState {
  switch (action.type) {
    case variables.UPDATE_VARIABLES:
      return { ...state, variables: action.payload };

    case variables.ADD_FILE_VARIABLE:
      // TODO: Backward compatibility check:
      state.files = state.files || [];

      // overwrite existing if it matches namme
      if (
        action.payload?.name &&
        state.files.find((f) => f.name === action.payload?.name)
      ) {
        return {
          ...state,
          files: state.files.map((f) => {
            if (f.name === action.payload?.name) {
              return {
                ...f,
                ...action.payload,
              };
            }

            return f;
          }),
        };
      }

      return {
        ...state,
        files: [
          ...state.files,
          initialFileVariableState(
            action.payload?.name,
            action.payload?.data,
            action.payload?.isMultiple
          ),
        ],
      };
    case variables.DELETE_FILE_VARIABLE:
      return {
        ...state,
        // TODO: Update to use id instead of index (keep backward compatibility)
        files: state.files.filter((val, i) => i !== action.payload.index),
      };
    case variables.UPDATE_FILE_VARIABLE_NAME:
      return {
        ...state,
        files: state.files.map((file, i) => {
          if (i === action.payload.index) {
            return { ...file, name: action.payload.name };
          }
          return file;
        }),
      };
    case variables.UPDATE_FILE_VARIABLE_DATA:
      return {
        ...state,
        files: state.files.map((file, i) => {
          // TODO: Update to use id instead of index (keep backward compatibility)
          if (i === action.payload.index) {
            return {
              ...file,
              id: file.id || initialFileVariableState().id,
              data: action.payload.fileData,
            };
          }
          return file;
        }),
      };
    case variables.UPDATE_FILE_VARIABLE_IS_MULTIPLE:
      return {
        ...state,
        files: state.files.map((file, i) => {
          if (i === action.payload.index) {
            return { ...file, isMultiple: action.payload.isMultiple };
          }
          return file;
        }),
      };
    default:
      return state;
  }
}
