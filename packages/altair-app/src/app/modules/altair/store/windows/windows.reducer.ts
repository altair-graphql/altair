import { ActionReducer, INIT } from '@ngrx/store';

import * as windowsActions from './windows.action';
import { IDictionary } from '../../interfaces/shared';
import { AllActions, InitWindowAction } from '../action';
import { normalize } from '../compatibility-normalizer';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

export const getInitWindowState = (
  perWindowReducer: ActionReducer<PerWindowState, AllActions>
) => perWindowReducer(undefined, new InitWindowAction());

/**
 * Metareducer to add new window and pass the correct window state to the main reducer
 * @param reducer
 */
export function windows(reducer: ActionReducer<PerWindowState, AllActions>) {
  const initialState: WindowState = {};

  return function (state = initialState, action: AllActions) {
    const _state = Object.assign({}, state);

    switch (action.type) {
      case windowsActions.ADD_WINDOW: {
        const {
          windowId,
          title,
          url,
          collectionId,
          windowIdInCollection,
          fixedTitle,
        } = action.payload;

        // Using JSON.parse and JSON.stringify instead of Object.assign for deep cloning
        const newWindow = <PerWindowState>(
          JSON.parse(JSON.stringify(getInitWindowState(reducer)))
        );

        newWindow.layout.title = title;
        newWindow.layout.hasDynamicTitle = !fixedTitle;
        newWindow.windowId = windowId;
        if (url) {
          newWindow.query.url = url;
        }

        if (collectionId) {
          newWindow.layout.collectionId = collectionId;
        }
        if (windowIdInCollection) {
          newWindow.layout.windowIdInCollection = windowIdInCollection;
        }

        _state[windowId] = newWindow;

        return _state;
      }
      case windowsActions.SET_WINDOWS: {
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
      }
      case windowsActions.REMOVE_WINDOW: {
        const _windowId = action.payload.windowId;

        if (_state[_windowId]) {
          delete _state[_windowId];
        }

        return Object.assign({}, _state);
      }
      default: {
        const _action: AllActions = action;

        if (_action.type === INIT) {
          // Run normalizer at initialization to fix backward compatibility issues
          // run compatibilty normalizer here
          return normalize(_state);
        }

        if (!('windowId' in _action)) {
          return _state;
        }

        const _windowState = _state[_action.windowId];

        if (!_windowState) {
          // Just return state. The action was probably not for a PerWindow reducer
          return _state;
        }

        // Delegate the unknown action to the passed reducer to handle,
        // passing it the correct window state based on the provided windowId
        const reduced = reducer(_windowState, action);
        _state[_action.windowId] = { ...reduced, windowId: _action.windowId };

        return _state;
      }
    }
  };
}
