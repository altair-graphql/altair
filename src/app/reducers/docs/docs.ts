import { Action } from '@ngrx/store';

import * as docs from '../../actions/docs/docs';

export interface State {
    showDocs: boolean;
}

const initialState: State = {
    showDocs: false
};

export function docsReducer(state = initialState, action: Action): State {
    switch (action.type) {
        case docs.TOGGLE_DOCS_VIEW:
            return Object.assign({}, state, { showDocs: !state.showDocs });
        default:
            return state;
    }
}
