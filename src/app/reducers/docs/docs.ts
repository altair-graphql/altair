import { Action } from '@ngrx/store';

import * as docs from '../../actions/docs/docs';

export interface State {
    showDocs: boolean;
    isLoading: boolean;
}

const initialState: State = {
    showDocs: false,
    isLoading: false
};

export function docsReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case docs.TOGGLE_DOCS_VIEW:
            return Object.assign({}, state, { showDocs: !state.showDocs });
        case docs.START_LOADING_DOCS:
            return Object.assign({}, state, { isLoading: true });
        case docs.STOP_LOADING_DOCS:
            return Object.assign({}, state, { isLoading: false });
        default:
            return state;
    }
}
