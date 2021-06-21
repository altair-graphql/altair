
import { DocsState } from 'altair-graphql-core/build/types/state/docs.interfaces';
import * as docs from '../../store/docs/docs.action';


export const getInitialState = (): DocsState => {
    return {
        showDocs: false,
        isLoading: false,
        docView: {
            view: 'root',
            parentType: 'Query',
            name: ''
        },
    }
};

export function docsReducer(state = getInitialState(), action: docs.Action): DocsState {
    switch (action.type) {
        case docs.TOGGLE_DOCS_VIEW:
            return Object.assign({}, state, { showDocs: !state.showDocs });
        case docs.START_LOADING_DOCS:
            return Object.assign({}, state, { isLoading: true });
        case docs.STOP_LOADING_DOCS:
            return Object.assign({}, state, { isLoading: false });
        case docs.SET_DOC_VIEW:
            return { ...state, docView: action.payload.docView };
        default:
            return state;
    }
}
