import { INIT } from '@ngrx/store';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import deepmerge from 'deepmerge';
import { Transaction } from 'dexie';
import { debounce } from 'lodash-es';
import { LocalStorageConfig, rehydrateApplicationState } from 'ngrx-store-localstorage';
import { ActionWithPayload, AppInitAction, APP_INIT_ACTION } from './action';
import { StorageService } from '../services/storage/storage.service';
import { IDictionary } from '../interfaces/shared';
import { debug } from '../utils/logger';
import { localStorageSyncConfig } from './local-storage-sync-config';
import { getAltairConfig } from '../config';
import type { State } from './index';

type StateKey = keyof State;

const normalizeToKeyValue = (state: Partial<State>, keys: StateKey[], storageNamespace: string) => {
  const normalized: IDictionary = {};

  keys.forEach((key: StateKey) => {
    if (key === 'windows' && state[key]) {
      const windowState = state[key]!;
      // handle specially
      Object.keys(windowState).forEach(windowId => {
        normalized[`[${storageNamespace}]::${key}::${windowId}`] = windowState[windowId];
        normalized[`[${storageNamespace}]::${key}::${windowId}::schema`] = windowState[windowId].schema;
      });
    } else {
      normalized[`[${storageNamespace}]::${key}`] = state[key];
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
const getSyncOperations = (oldState: Partial<State>, newState: Partial<State>, keys: StateKey[], storageNamespace: string) => {
  const ops: SyncOperation[] = [];
  const normalizedOldState = normalizeToKeyValue(oldState, keys, storageNamespace);
  const normalizedNewState = normalizeToKeyValue(newState, keys, storageNamespace);

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
      let valueToStore = normalizedNewState[key];
      if (key.includes('windows::') && !key.endsWith('::schema')) {
        valueToStore = {...valueToStore, schema: undefined};
      }
      ops.push({
        operation: 'put',
        key,
        value: JSON.stringify(valueToStore),
      });
    }
  });

  return ops;
};

const updateSyncOperations = (oldState: Partial<State>, newState: Partial<State>, keys: StateKey[], storageNamespace: string) => {
  const newOps = getSyncOperations(oldState, newState, keys, storageNamespace);
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

export const getAppStateFromStorage = async({
  updateFromLocalStorage = false,
  forceUpdateFromProvidedData = false,
  storage = undefined as unknown as Storage,
}) => {
  const asyncStorage = new StorageService();
  let stateList = await asyncStorage.appState.toArray();
  const storageNamespace = getAltairConfig().initialData.instanceStorageNamespace;
  const reducedState: Partial<State> & { windows: State['windows'] } = {
    windows: {},
  };

  if (forceUpdateFromProvidedData || !stateList.length) {
    if (!updateFromLocalStorage) {
      return;
    }
    // migrate the data from localStorage into async storage
    const hydratedState = rehydrateApplicationState(
      localStorageSyncConfig.keys,
      storage || localStorageSyncConfig.storage,
      localStorageSyncConfig.storageKeySerializer,
      localStorageSyncConfig.restoreDates,
    );
    debug.log('pulling state from localStorage since async storage is empty..');
    updateSyncOperations({}, hydratedState, localStorageSyncConfig.keys as StateKey[], storageNamespace);
    await syncStateUpdate();

    stateList = await asyncStorage.appState.toArray();
    if (!stateList.length) {
      return;
    }
    // TODO: Clean from localStorage
  }

  const schemas: IDictionary = {};
  stateList.forEach((curStateItem) => {
    if (!curStateItem.key.startsWith(`[${storageNamespace}]::`)) {
      return;
    }
    const key = curStateItem.key.replace(`[${storageNamespace}]::`, '') as StateKey;
    // Handle reducing window state
    if (key.includes('windows::')) {
      // Handle reducing schema state
      if (key.endsWith('::schema')) {
        const windowId = key.replace('windows::', '').replace('::schema', '');
        const schema = JSON.parse(curStateItem.value);
        if (windowId in reducedState.windows) {
          reducedState.windows[windowId].schema = schema;
        } else {
          schemas[windowId] = JSON.parse(curStateItem.value);
        }
      } else {
        // handle backward-compatible case, before schema was removed from stored window state
        const windowId = key.replace('windows::', '');
        reducedState.windows[windowId] = JSON.parse(curStateItem.value);
        if (windowId in schemas) {
          reducedState.windows[windowId].schema = schemas[windowId];
        }
      }
    } else {
      reducedState[key] = JSON.parse(curStateItem.value);
    }
  });

  return reducedState as State;
};

export const importIndexedRecords = (records: { key: string, value: any }[]) => {
  const asyncStorage = new StorageService();
  return asyncStorage.transaction('rw', asyncStorage.appState, async() => {

    const ops: Promise<any>[] = [];

    records.forEach(record => {
      ops.push(
        asyncStorage.appState.put({
          key: record.key,
          value: record.value,
        })
      );
    });

    return Promise.all(ops);
  });
};

export const asyncStorageSync = (opts: LocalStorageConfig) => (reducer: any) => {
  const storageNamespace = getAltairConfig().initialData.instanceStorageNamespace;

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

    if (![INIT, ROOT_EFFECTS_INIT, APP_INIT_ACTION].includes(action.type)) {
      // update storage
      // Queue update changes before debouncing
      debug.log('debouncing update..');
      updateSyncOperations(state, nextState, opts.keys, storageNamespace);
      debouncedSyncStateUpdate();
    }

    return nextState;
  };
};

// const syncStateUpdate = (oldState: any, newState: any, keys: string[], immediate = false) => {
//   updateSyncOperations(oldState, newState, keys);
//   debouncedSyncStateUpdate();
// };
