import { Action, ActionReducer } from '@ngrx/store';

import * as windowsActions from '../actions/windows/windows';
import * as fromRoot from './';

export interface State {
    [id: string]: fromRoot.PerWindowState;
}

export interface ExportWindowState {
  version: 1;
  type: 'window';
  windowName: string;
  apiUrl: string;
  query: string;
  headers: Array<{key: string, value: string}>;
  variables: string;
  subscriptionUrl: string;
}

/**
 * Metareducer to add new window and pass the correct window state to the main reducer
 * @param reducer
 */
export function windows(reducer: ActionReducer<any>) {
    const initKey = `__x__`;
    const initWindowState = reducer(undefined, {type: '___INIT___'});
    const initialState: State = {};

    return function(state = initialState, action: any) {

        const _state = Object.assign({}, state);
        let _windowState = _state[action.windowId];

        switch (action.type) {
            case windowsActions.ADD_WINDOW:
                const { windowId, title, url } = action.payload;

                // Using JSON.parse and JSON.stringify instead of Object.assign for deep cloning
                _state[windowId] = JSON.parse(JSON.stringify(initWindowState));

                _state[windowId].layout.title = title;
                _state[windowId].windowId = windowId;
                _state[windowId].query.url = url;

                return _state;
            case windowsActions.SET_WINDOWS:
                const _windows = action.payload;

                const newWindowsState = {};
                _windows.forEach(window => {
                    const windowKey = window.windowId;
                    const windowTitle = window.title;

                    // Using JSON.parse and JSON.stringify instead of Object.assign for deep cloning
                    _windowState = JSON.parse(JSON.stringify(initWindowState));
                    _windowState.windowId = windowKey;
                    _windowState.layout.title = _windowState.layout.title || windowTitle;

                    newWindowsState[windowKey] = { ..._windowState };
                });

                return newWindowsState;
            case windowsActions.REMOVE_WINDOW:
                const _windowId = action.payload.windowId;

                if (_state[_windowId]) {
                    delete _state[_windowId];
                }

                return Object.assign({}, _state);
            default:
                if (!_windowState) {
                    // If the provided windowId is invalid, log the error and just return the state
                    console.warn('Invalid window ID provided.');
                    return _state;
                }

                // Delegate the unknown action to the passed reducer to handle,
                // passing it the correct window state based on the provided windowId
                _state[action.windowId] = reducer(_windowState, action);
                _state[action.windowId].windowId = action.windowId;

                return _state;
        }
    };
}
