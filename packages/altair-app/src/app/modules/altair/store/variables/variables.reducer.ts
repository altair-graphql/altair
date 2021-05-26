import { Action } from '@ngrx/store';

import * as variables from './variables.action';
import { getAltairConfig } from '../../config';
import uuid from 'uuid/v4';

export interface FileVariable {
    id?: string; // optional for backward compatibility
    name: string;
    isMultiple?: boolean;
    data?: File | File[]; // TODO: Remove File (maintaining for backward compatibility)
}

const initialFileVariableState = () => ({
    id: uuid(),
    name: 'file',
});
export interface State {
    variables: string;
    files: FileVariable[];
}

export const getInitialState = (): State => {
    const altairConfig = getAltairConfig();
    return {
        variables: altairConfig.initialData.variables ? '' + altairConfig.initialData.variables : '{}',
        files: [],
    };
};

export function variableReducer(state = getInitialState(), action: variables.Action): State {
    switch (action.type) {
        case variables.UPDATE_VARIABLES:
            return { ...state, variables: action.payload };

        case variables.ADD_FILE_VARIABLE:
            // TODO: Backward compatibility check:
            state.files = state.files || [];

            return {
                ...state,
                files: [
                    ...state.files,
                    {
                        ...initialFileVariableState()
                    }
                ]
            };
        case variables.DELETE_FILE_VARIABLE:
            return {
                ...state,
                // TODO: Update to use id instead of index (keep backward compatibility)
                files: state.files.filter((val, i) => i !== action.payload.index)
            };
        case variables.UPDATE_FILE_VARIABLE_NAME:
            return {
                ...state,
                files: state.files.map((file, i) => {
                    if (i === action.payload.index) {
                        return { ...file, name: action.payload.name };
                    }
                    return file;
                })
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
                })
            };
        case variables.UPDATE_FILE_VARIABLE_IS_MULTIPLE:
            return {
                ...state,
                files: state.files.map((file, i) => {
                    if (i === action.payload.index) {
                        return { ...file, isMultiple: action.payload.isMultiple };
                    }
                    return file;
                })
            };
        default:
            return state;
    }
}
