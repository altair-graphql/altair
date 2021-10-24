import { Action, ActionReducer, INIT } from '@ngrx/store';

import * as windowsActions from './windows.action';
import { IDictionary } from '../../interfaces/shared';
import { INIT_WINDOW } from '../action';
import { normalize } from '../compatibility-normalizer';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';


export const getInitWindowState = (perWindowReducer: ActionReducer<PerWindowState>) => perWindowReducer(undefined, { type: INIT_WINDOW });

/**
 * Metareducer to add new window and pass the correct window state to the main reducer
 * @param reducer
 */
export function windows(reducer: ActionReducer<PerWindowState>) {
    const initialState: WindowState = {};

    return function(state = initialState, action: windowsActions.Action) {

        const _state = Object.assign({}, state);

        switch (action.type) {
            case windowsActions.ADD_WINDOW:
                const { windowId, title, url, collectionId, windowIdInCollection, fixedTitle } = action.payload;

                // Using JSON.parse and JSON.stringify instead of Object.assign for deep cloning
                _state[windowId] = JSON.parse(JSON.stringify(getInitWindowState(reducer)));

                _state[windowId].layout.title = title;
                _state[windowId].layout.hasDynamicTitle = !fixedTitle;
                // _state
                _state[windowId].windowId = windowId;
                if (url) {
                    _state[windowId].query.url = url;
                }

                if (collectionId) {
                    _state[windowId].layout.collectionId = collectionId;
                }
                if (windowIdInCollection) {
                    _state[windowId].layout.windowIdInCollection = windowIdInCollection;
                }

                return _state;
            case windowsActions.SET_WINDOWS:
                const _windows = action.payload;

                const newWindowsState: IDictionary<PerWindowState> = {};
                _windows.forEach((window: PerWindowState) => {
                    const windowKey = window.windowId;
                    // const windowTitle = window.layout.title;

                    // Using JSON.parse and JSON.stringify instead of Object.assign for deep cloning
                    // _windowState = JSON.parse(JSON.stringify(initWindowState));
                    // _windowState.windowId = windowKey;

                    newWindowsState[windowKey] = { ...window };
                });

                return newWindowsState;
            case windowsActions.REMOVE_WINDOW:
                const _windowId = action.payload.windowId;

                if (_state[_windowId]) {
                    delete _state[_windowId];
                }

                return Object.assign({}, _state);
            default:
                const _action: any = action;
                const _windowState = _state[_action.windowId];

                if (!_windowState) {
                    if (_action.type === INIT) {
                        // Run normalizer at initialization to fix backward compatibility issues
                        // run compatibilty normalizer here
                        return normalize(_state);
                    }
                    // Just return state. The action was probably not for a PerWindow reducer
                    return _state;
                }

                // Delegate the unknown action to the passed reducer to handle,
                // passing it the correct window state based on the provided windowId
                const reduced = reducer(_windowState, action);
                _state[_action.windowId] = { ...reduced, windowId: _action.windowId };

                return _state;
        }
    };
}
