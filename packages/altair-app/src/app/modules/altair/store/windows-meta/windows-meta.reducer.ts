import { WindowsMetaState } from 'altair-graphql-core/build/types/state/windows-meta.interfaces';
import { AllActions } from '../action';

import * as windowsMeta from './windows-meta.action';

export const getInitialState = (): WindowsMetaState => {
  return {
    activeWindowId: '',
    windowIds: [],
    showImportCurlDialog: false,
    showAddToCollectionDialog: false,
    showEditCollectionDialog: false,
    showSettingsDialog: false,
    showEnvironmentManager: false,
    showPluginManager: false,
    showAccountDialog: false,
    showTeamsDialog: false,
    showUpgradeDialog: false,
  };
};

export function windowsMetaReducer(
  state = getInitialState(),
  action: AllActions
): WindowsMetaState {
  switch (action.type) {
    case windowsMeta.SET_ACTIVE_WINDOW_ID:
      return { ...state, activeWindowId: action.payload.windowId };
    case windowsMeta.SET_NEXT_WINDOW_ACTIVE: {
      const idx = state.windowIds.findIndex((id) => id === state.activeWindowId);
      let newActiveWindowId = '';
      if (idx >= state.windowIds.length - 1) {
        newActiveWindowId = state.windowIds[0] ?? '';
      } else {
        newActiveWindowId = state.windowIds[idx + 1] ?? '';
      }
      return { ...state, activeWindowId: newActiveWindowId };
    }
    case windowsMeta.SET_PREVIOUS_WINDOW_ACTIVE: {
      const idx = state.windowIds.findIndex((id) => id === state.activeWindowId);
      let newActiveWindowId = '';
      if (idx <= 0) {
        newActiveWindowId = state.windowIds[state.windowIds.length - 1] ?? '';
      } else {
        newActiveWindowId = state.windowIds[idx - 1] ?? '';
      }
      return { ...state, activeWindowId: newActiveWindowId };
    }
    case windowsMeta.SET_WINDOW_IDS:
      return { ...state, windowIds: action.payload.ids };
    case windowsMeta.REPOSITION_WINDOW: {
      const curPos = action.payload.currentPosition;
      const newPos = action.payload.newPosition;

      if (
        curPos > -1 &&
        curPos < state.windowIds.length &&
        newPos > -1 &&
        newPos < state.windowIds.length
      ) {
        const arr = [...state.windowIds];
        arr.splice(newPos, 0, arr.splice(curPos, 1)[0]!);

        return { ...state, windowIds: [...arr] };
      }
      return state;
    }
    case windowsMeta.SHOW_IMPORT_CURL_DIALOG:
      if (action.payload) {
        return { ...state, showImportCurlDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_EDIT_COLLECTION_DIALOG:
      if (action.payload) {
        return { ...state, showEditCollectionDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_ADD_TO_COLLECTION_DIALOG:
      if (action.payload) {
        return { ...state, showAddToCollectionDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_SETTINGS_DIALOG:
      if (action.payload) {
        return { ...state, showSettingsDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_ENVIRONMENT_MANAGER:
      if (action.payload) {
        return { ...state, showEnvironmentManager: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_PLUGIN_MANAGER:
      if (action.payload) {
        return { ...state, showPluginManager: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_ACCOUNT_DIALOG:
      if (action.payload) {
        return { ...state, showAccountDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_TEAMS_DIALOG:
      if (action.payload) {
        return { ...state, showTeamsDialog: action.payload.value };
      }
      return state;
    case windowsMeta.SHOW_UPGRADE_DIALOG:
      if (action.payload) {
        return { ...state, showUpgradeDialog: action.payload.value };
      }
      return state;
    default:
      return state;
  }
}
