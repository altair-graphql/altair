import { INIT } from '@ngrx/store';
import { LocalStorageConfig, rehydrateApplicationState } from 'ngrx-store-localstorage';
import { ActionWithPayload, AppInitAction, APP_INIT_ACTION } from './action';
import deepmerge from 'deepmerge';
import { StorageService } from 'app/services/storage/storage.service';
import { IDictionary } from 'app/interfaces/shared';
import { Transaction } from 'dexie';
import { debounce } from 'lodash-es';
import { debug } from 'app/utils/logger';
import { localStorageSyncConfig } from './local-storage-sync-config';

const normalizeToKeyValue = (state: any, keys: string[]) => {
  const normalized: IDictionary = {};
  keys.forEach(key => {
    if (key === 'windows' && state[key]) {
      // handle specially
      Object.keys(state[key]).forEach(windowId => {
        normalized[`${key}::${windowId}`] = state[key][windowId];
      });
    } else {
      normalized[key] = state[key];
    }
  });

  return normalized;
};

interface SyncOperation {
  operation: 'put' | 'delete';
  key: string;
  value?: string;
}

let syncTransaction: Transaction | null = null;
let syncOperations: SyncOperation[] = [];
// { operation: 'put', key, value };
const getSyncOperations = (oldState: any, newState: any, keys: string[]) => {
  const ops: SyncOperation[] = [];
  const normalizedOldState = normalizeToKeyValue(oldState, keys);
  const normalizedNewState = normalizeToKeyValue(newState, keys);

  // Get old keys from old state and remove any undefined in new state (especially window state)
  const removedKeys = Object.keys(normalizedOldState).filter(key => !Object.keys(normalizedNewState).includes(key));

  removedKeys.forEach(key => {
    ops.push({
      operation: 'delete',
      key,
    });
  });

  Object.keys(normalizedNewState).map(key => {
    // Add operation only if value is changed
    if (normalizedNewState[key] !== normalizedOldState[key]) {
      ops.push({
        operation: 'put',
        key,
        value: JSON.stringify(normalizedNewState[key]),
      });
    }
  });

  return ops;
};

const updateSyncOperations = (oldState: any, newState: any, keys: string[]) => {
  const newOps = getSyncOperations(oldState, newState, keys);
  syncOperations = syncOperations.filter(op => !newOps.find(no => no.key === op.key)).concat(newOps);
};

const syncStateUpdate = () => {
  const asyncStorage = new StorageService();
  if (syncTransaction) {
    syncTransaction.abort();
    syncTransaction = null;
  }

  debug.log('updating state...');
  return asyncStorage.transaction('rw', asyncStorage.appState, async(trans) => {
    // Store transaction handles for cancellation later
    syncTransaction = trans;

    const ops: Promise<any>[] = [];

    syncOperations.forEach(op => {
      switch (op.operation) {
        case 'put':
          ops.push(
            asyncStorage.appState.put({
              key: op.key,
              value: op.value,
            })
          );
          break;
        case 'delete':
          ops.push(
            asyncStorage.appState.delete(op.key)
          );
          break;
      }
    });

    // flush the sync operations list
    syncOperations = [];

    return Promise.all(ops);
  });
};
const debouncedSyncStateUpdate = debounce(syncStateUpdate, 1000);

export const defaultMergeReducer = (state: any, rehydratedState: any, action: any) => {
  if (action.type === APP_INIT_ACTION && rehydratedState) {
      const overwriteMerge = (destinationArray: any, sourceArray: any) => sourceArray;
      const options: deepmerge.Options = {
          arrayMerge: overwriteMerge,
      };

      state = deepmerge(state, rehydratedState, options);
  }

  return state;
};

export const getAppStateFromStorage = async(updateFromLocalStorage = false) => {
  const asyncStorage = new StorageService();
  let stateList = await asyncStorage.appState.toArray();
  const reducedState: IDictionary = {
    windows: {},
  };

  if (!stateList.length) {
    if (!updateFromLocalStorage) {
      return;
    }
    // migrate the data from localStorage into async storage
    const hydratedState = rehydrateApplicationState(
      localStorageSyncConfig.keys,
      localStorageSyncConfig.storage,
      localStorageSyncConfig.storageKeySerializer,
      localStorageSyncConfig.restoreDates,
    );
    updateSyncOperations({}, hydratedState, localStorageSyncConfig.keys);
    debug.log('pulling state from localStorage since async storage is empty..');
    await syncStateUpdate();

    stateList = await asyncStorage.appState.toArray();
    if (!stateList.length) {
      return;
    }
    // TODO: Clean from localStorage
  }

  stateList.forEach((curStateItem) => {
    if (curStateItem.key.includes('windows::')) {
      // Handle reducing window state
      reducedState.windows[curStateItem.key.replace('windows::', '')] = JSON.parse(curStateItem.value);
    } else {
      reducedState[curStateItem.key] = JSON.parse(curStateItem.value);
    }
  });

  return reducedState;
};

export const asyncStorageSync = (opts: LocalStorageConfig) => (reducer: any) => {
  return function (state: any, action: ActionWithPayload) {
    let nextState: any;

    // If state arrives undefined, we need to let it through the supplied reducer
    // in order to get a complete state as defined by user
    if (action.type === INIT && !state) {
        nextState = reducer(state, action);
    } else {
        nextState = { ...state };
    }
    // Merge the store state with the rehydrated state using
    // either a user-defined reducer or the default.
    if (action.type === APP_INIT_ACTION) {
      if (action.payload?.initialState) {
        nextState = defaultMergeReducer(nextState, (action as AppInitAction).payload.initialState, action);
      }
    }

    nextState = reducer(nextState, action);

    if (![INIT, APP_INIT_ACTION].includes(action.type)) {
      // update storage
      // Queue update changes before debouncing
      updateSyncOperations(state, nextState, opts.keys);
      debouncedSyncStateUpdate();
    }

    return nextState;
  };
};

// const syncStateUpdate = (oldState: any, newState: any, keys: string[], immediate = false) => {
//   updateSyncOperations(oldState, newState, keys);
//   debouncedSyncStateUpdate();
// };
