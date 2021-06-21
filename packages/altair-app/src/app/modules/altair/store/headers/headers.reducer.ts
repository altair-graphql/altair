import { getAltairConfig } from 'altair-graphql-core/build/config';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import * as headers from './headers.action';

export const getInitialHeadersState = () => {
    const altairConfig = getAltairConfig();
    let initialHeaders: HeaderState = [];
    if (altairConfig.initialData.headers) {
        initialHeaders = Object.keys(altairConfig.initialData.headers).map(key => ({
            key,
            value: altairConfig.initialData.headers[key] ? '' + altairConfig.initialData.headers[key] : '',
            enabled: true,
        }));
    }
    initialHeaders = [ ...initialHeaders, { key: '', value: '', enabled: true } ];

    return initialHeaders;
};


export function headerReducer(state = getInitialHeadersState(), action: headers.Action): HeaderState {
    switch (action.type) {
        case headers.ADD_HEADER:
            return [
                ...state,
                { key: '', value: '', enabled: true }
            ];
        case headers.SET_HEADERS:
            return [ ...action.payload.headers ];
        case headers.EDIT_HEADER_KEY:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { ...val, key: action.payload.val };
                }
                return val;
            });
        case headers.EDIT_HEADER_VALUE:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { ...val, value: action.payload.val };
                }
                return val;
            });
        case headers.EDIT_HEADER_ENABLED:
            return state.map((val, i) => {
                if (i === action.payload.i) {
                    return { ...val, enabled: action.payload.val };
                }
                return val;
            });
        case headers.REMOVE_HEADER:
            return state.filter((val, i) => {
                return i !== action.payload;
            });
        // case INIT_PER_WINDOW_ACTION_TYPE:
        //     console.log('backward compatibility!', action, state);
        //     // Ensure backward compatibility
        //     return state.map(header => {
        //         return {
        //             ...header,
        //             enabled: header.enabled === false ? header.enabled : true
        //         }
        //     });
        default:
            return state;
    }
}
