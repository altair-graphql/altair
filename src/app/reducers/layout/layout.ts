import { Action } from '@ngrx/store';

import * as query from '../../actions/query/query';
import * as layout from '../../actions/layout/layout';

export interface State {
    isLoading: boolean;
    title: string;
}

const initialState: State = {
    isLoading: false,
    title: 'New window'
};

export function layoutReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case layout.START_LOADING:
            return Object.assign({}, state, { isLoading: true });
        case layout.STOP_LOADING:
            return Object.assign({}, state, { isLoading: false });
        case layout.SET_WINDOW_NAME:
            return Object.assign({}, state, { title: action.payload });
        default:
            return state;
    }
}
