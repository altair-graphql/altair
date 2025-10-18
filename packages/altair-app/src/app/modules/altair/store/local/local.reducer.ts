// This would contain arbitrary data that should be stored in memory and not persisted

import * as local from './local.action';
import { LocalState } from 'altair-graphql-core/build/types/state/local.interfaces';
import { AllActions } from '../action';

const MAX_CLOSED_WINDOWS_LENGTH = 50;

export const getInitialState = (): LocalState => {
  return {
    closedWindows: [],
    installedPlugins: {},
    panels: [],
    uiActions: [],
    temporaryWindowStates: {},
  };
};

const mapRequestStateActionEntryToRequestState = (
  entry: local.WindowRequestStateActionEntry
) => {
  // Construct ID from each entry's source and sourceId
  const id = `${entry.source}-${entry.type}-${entry.sourceId}`;
  const name = `${entry.source} (${entry.type})`;
  return { ...entry, id, name, state: entry.state || 'pending' };
};

const mapRequestStateActionEntriesToRequestState = (
  entries: local.WindowRequestStateActionEntry[]
) => {
  return entries.map((entry) => mapRequestStateActionEntryToRequestState(entry));
};

export function localReducer(
  state = getInitialState(),
  action: AllActions
): LocalState {
  const len = state.closedWindows.length;
  switch (action.type) {
    case local.PUSH_CLOSED_WINDOW_TO_LOCAL:
      return {
        ...state,
        closedWindows:
          len === MAX_CLOSED_WINDOWS_LENGTH
            ? [...state.closedWindows.slice(1), action.payload.window]
            : [...state.closedWindows, action.payload.window],
      };
    case local.POP_FROM_CLOSED_WINDOWS:
      return {
        ...state,
        closedWindows: state.closedWindows.filter((_, i) => i < len - 1),
      };

    case local.ADD_INSTALLED_PLUGIN_ENTRY: {
      if (state.installedPlugins[action.payload.name]) {
        throw new Error(
          `plugin already registered with same name [${action.payload.name}]`
        );
      }

      return {
        ...state,
        installedPlugins: {
          ...state.installedPlugins,
          [action.payload.name]: {
            isActive: false,
            ...action.payload,
          },
        },
      };
    }
    case local.SET_PLUGIN_ACTIVE: {
      return {
        ...state,
        installedPlugins: {
          ...state.installedPlugins,
          [action.payload.pluginName]: {
            ...state.installedPlugins[action.payload.pluginName]!,
            isActive: action.payload.isActive,
          },
        },
      };
    }
    case local.ADD_PANEL: {
      return {
        ...state,
        panels: [...state.panels, action.payload],
      };
    }
    case local.REMOVE_PANEL: {
      return {
        ...state,
        panels: state.panels.filter((panel) => panel.id !== action.payload.panelId),
      };
    }
    case local.SET_PANEL_ACTIVE: {
      const curPanel = state.panels.find(
        (panel) => panel.id === action.payload.panelId
      );
      return {
        ...state,
        panels: state.panels.map((panel) => {
          if (panel.id === action.payload.panelId) {
            panel.isActive = action.payload.isActive;
          } else if (panel.location === curPanel?.location) {
            panel.isActive = false;
          }
          return panel;
        }),
      };
    }
    case local.ADD_UI_ACTION: {
      return {
        ...state,
        uiActions: [...state.uiActions, action.payload],
      };
    }
    case local.REMOVE_UI_ACTION: {
      return {
        ...state,
        uiActions: state.uiActions.filter(
          (uiAction) => uiAction.id !== action.payload.actionId
        ),
      };
    }
    case local.SET_WINDOW_LOADING_REQUEST_STATE: {
      const temporaryWindowState = state.temporaryWindowStates[
        action.payload.windowId
      ] || { windowId: action.payload.windowId, loadingRequestState: [] };
      return {
        ...state,
        temporaryWindowStates: {
          ...state.temporaryWindowStates,
          [action.payload.windowId]: {
            ...temporaryWindowState,
            loadingRequestState: mapRequestStateActionEntriesToRequestState(
              action.payload.loadingRequestState
            ),
          },
        },
      };
    }
    case local.APPEND_WINDOW_LOADING_REQUEST_STATE: {
      const temporaryWindowState = state.temporaryWindowStates[
        action.payload.windowId
      ] || { windowId: action.payload.windowId, loadingRequestState: [] };
      const remappedEntries = mapRequestStateActionEntriesToRequestState(
        action.payload.entries
      );
      const existingIds = new Set(
        temporaryWindowState.loadingRequestState.map((entry) => entry.id)
      );
      const newEntries = remappedEntries.filter(
        (entry) => !existingIds.has(entry.id)
      );

      return {
        ...state,
        temporaryWindowStates: {
          ...state.temporaryWindowStates,
          [action.payload.windowId]: {
            ...temporaryWindowState,
            loadingRequestState: [
              ...temporaryWindowState.loadingRequestState,
              ...newEntries,
            ],
          },
        },
      };
    }
    case local.PREPEND_WINDOW_LOADING_REQUEST_STATE: {
      const temporaryWindowState = state.temporaryWindowStates[
        action.payload.windowId
      ] || { windowId: action.payload.windowId, loadingRequestState: [] };
      const remappedEntries = mapRequestStateActionEntriesToRequestState(
        action.payload.entries
      );
      const existingIds = new Set(
        temporaryWindowState.loadingRequestState.map((entry) => entry.id)
      );
      const newEntries = remappedEntries.filter(
        (entry) => !existingIds.has(entry.id)
      );

      return {
        ...state,
        temporaryWindowStates: {
          ...state.temporaryWindowStates,
          [action.payload.windowId]: {
            ...temporaryWindowState,
            loadingRequestState: [
              ...newEntries,
              ...temporaryWindowState.loadingRequestState,
            ],
          },
        },
      };
    }
    case local.UPDATE_WINDOW_LOADING_REQUEST_ENTRY_STATE: {
      const temporaryWindowState = state.temporaryWindowStates[
        action.payload.windowId
      ] || { windowId: action.payload.windowId, loadingRequestState: [] };
      const updatedEntry = mapRequestStateActionEntryToRequestState(
        action.payload.entry
      );
      return {
        ...state,
        temporaryWindowStates: {
          ...state.temporaryWindowStates,
          [action.payload.windowId]: {
            ...temporaryWindowState,
            loadingRequestState: temporaryWindowState.loadingRequestState.map(
              (entry) => {
                if (entry.id === updatedEntry.id) {
                  return {
                    ...entry,
                    ...updatedEntry,
                  };
                }
                return entry;
              }
            ),
          },
        },
      };
    }
    default:
      return state;
  }
}
