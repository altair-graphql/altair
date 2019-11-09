import { Action } from '@ngrx/store';

import * as variables from '../../actions/variables/variables';
import config from 'app/config';

export interface FileVariable {
    name: string;
    data?: File;
}

const initialFileVariableState: FileVariable = {
    name: '',
};
export interface State {
    variables: string;
    files: FileVariable[];
}

export const initialState: State = {
    variables: config.initialData.variables || '{}',
    files: [],
};

export function variableReducer(state = initialState, action: variables.Action): State {
    switch (action.type) {
        case variables.UPDATE_VARIABLES:
            return { ...state, variables: action.payload };

        case variables.ADD_FILE_VARIABLE:
            // Backward compatibility check:
            state.files = state.files || [];

            return {
                ...state, files: [
                    ...state.files,
                    {
                        ...initialFileVariableState
                    }
                ]
            };
        case variables.DELETE_FILE_VARIABLE:
            return {
                ...state,
                files: state.files.filter((val, i) => i !== action.payload.index)
            };
        case variables.UPDATE_FILE_VARIABLE_NAME:
            return {
                ...state,
                files: state.files.map((file, i) => {
                    if (i === action.payload.index) {
                        file.name = action.payload.name;
                    }
                    return file;
                })
            };
        case variables.UPDATE_FILE_VARIABLE_DATA:
            return {
                ...state,
                files: state.files.map((file, i) => {
                    if (i === action.payload.index) {
                        file.data = action.payload.fileData;
                    }
                    return file;
                })
            };
        default:
            return state;
    }
}
