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
import { set } from 'object-path';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';

type StateKey = keyof RootState;

const specialStorePaths = [
  'windows.$$',
  'windows.$$.schema',
];

const purgePaths = [
  'windows.$$.schema', // purge schema from windows.$$
];

export const normalizeToKeyValue = (state: Partial<RootState>, keys: StateKey[], storageNamespace: string) => {
  const normalized: IDictionary = {};

  // Handle special path
  const specialPathParts = specialStorePaths.map(_ => _.split('.'));
  specialPathParts.forEach(parts => {
    const keyPartsValuePairs = _normalizeToResolvedKeyPartsValuePairs(parts, state);

    keyPartsValuePairs.forEach(({ keyParts, value }) => {
      const resolvedKey = [ `[${storageNamespace}]`, ...keyParts ].join('::');
      normalized[resolvedKey] = value;
    });
  });

  keys.forEach((key: StateKey) => {
    const isSpecialCase = specialPathParts.find(parts => parts[0] === key);

    if (!isSpecialCase && state[key]) {
      normalized[`[${storageNamespace}]::${key}`] = state[key];
    }
  });

  return normalized;
};

export const _normalizeToResolvedKeyPartsValuePairs = (patternParts: string[], object: any) => {
  let res: { keyParts: string[], value: any }[] = [];
  const [ currentKey, ...restParts ] = patternParts;

  if (typeof object === 'undefined') {
    return res;
  }

  if (!patternParts.length) {
    return [{
      keyParts: patternParts,
      value: object,
    }]
  }

  let resolvedKeys = [ currentKey ];
  // normalized key = value
  if (currentKey === '$$') {
    // handle Object.keys case
    resolvedKeys = Object.keys(object);
  } else if (object[currentKey]) {
    resolvedKeys = [ currentKey ];
  }

  resolvedKeys.forEach(key => {
    const x = _normalizeToResolvedKeyPartsValuePairs(restParts, object[key]).map(_ => {
      return {
        keyParts: [ key, ..._.keyParts ],
        value: _.value,
      }
    })
    res = [ ...res, ...x ];
  });

  return res;
};

interface SyncOperation {
  operation: 'put' | 'delete';
  key: string;
  value?: string;
}

let syncTransaction: Transaction | null = null;
let syncOperations: SyncOperation[] = [];
const getSyncOperations = (oldState: Partial<RootState>, newState: Partial<RootState>, keys: StateKey[], storageNamespace: string) => {
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
      const valueToStore = prepareValueToStore(key, normalizedNewState[key]);
      // let valueToStore = normalizedNewState[key];
      // if (key.includes('windows::') && !key.endsWith('::schema')) {
      //   valueToStore = {...valueToStore, schema: undefined};
      // }
      ops.push({
        operation: 'put',
        key,
        value: serializeValue(valueToStore),
      });
    }
  });

  return ops;
};

// namespace::windows::23456789 = data
export const prepareValueToStore = (key: string, data: any) => {
  const [ namespace, ...keyParts ] = key.split('::');
  data = { ...data };
  purgePaths.forEach(path => {
    const purgePathParts = path.split('.');
    // key parts exist in purge path
    const keyExistsinPurgePath = keyParts.every((part, i) => _partMatches(purgePathParts[i], part));

    if (keyExistsinPurgePath) {
      // remove all preceding parts in the key, so we can set the value for the path in the data
      const partsToSet = purgePathParts.filter((_, i) => !keyParts[i]);
      // set purge path in value as undefined (purged)
      data = _setValueInPath(partsToSet, data, undefined);
    }
  })

  return data;
};

// pattern/key, key
const _partMatches = (pattern1: string, key2: string) => {
  if (pattern1 === '$$' && key2) {
    return true;
  }

  return pattern1 === key2;
};

// sets value in path only if it exists
export const _setValueInPath = (pathParts: string | string[], object: any, value: any) => {
  const [ curPart, ...restParts ] = typeof pathParts === 'string' ? pathParts.split('.') : pathParts;

  if (typeof object === 'undefined') {
    return object;
  }

  if (typeof object === 'object') {
    object = { ...object };
  }

  if (!restParts.length && object && typeof object[curPart] !== 'undefined') {
    object[curPart] = value;
    return object;
  }

  let resolvedCurParts = [ curPart ];
  if (curPart === '$$') {
    // set all the Object.keys
    resolvedCurParts = Object.keys(object);
  }

  resolvedCurParts.forEach(_ => {
    if (typeof object[_] !== 'undefined') {
      object[_] = _setValueInPath(restParts, object[_], value);
    }
  });

  return object;
};

const updateSyncOperations = (oldState: Partial<RootState>, newState: Partial<RootState>, keys: StateKey[], storageNamespace: string) => {
  const newOps = getSyncOperations(oldState, newState, keys, storageNamespace);
  syncOperations = syncOperations.filter(op => !newOps.find(no => no.key === op.key)).concat(newOps);
};

const syncStateUpdate = async() => {
  try {
    const asyncStorage = new StorageService();
    if (syncTransaction) {
      syncTransaction.abort();
      syncTransaction = null;
    }

    debug.log('updating state...');
    return await asyncStorage.transaction('rw', asyncStorage.appState, async(trans) => {
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
  } catch (error) {
    console.error(new Error('Cannot sync state update :('));
    console.error(error);
  }
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
  const reducedState: Partial<RootState> = {};

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

  if (!stateList.length) {
    return;
  }

  const schemas: IDictionary = {};
  // sort stateList by key path parts count
  // i.e. 'windows::1234' should be read before 'window::1234::schema
  // to prevent mistakenly overwriting nested data
  stateList
    .sort((a, b) => a.key.split('::').length - b.key.split('::').length)
    .forEach((curStateItem) => {
      if (!curStateItem.key.startsWith(`[${storageNamespace}]::`)) {
        return;
      }
      const key = curStateItem.key.replace(`[${storageNamespace}]::`, '') as StateKey;
      set(reducedState, key.split('::'), parseValue(curStateItem.value));
      // Handle reducing window state
      // if (key.includes('windows::')) {
      //   // Handle reducing schema state
      //   if (key.endsWith('::schema')) {
      //     const windowId = key.replace('windows::', '').replace('::schema', '');
      //     const schema = parseValue(curStateItem.value);
      //     if (windowId in reducedState.windows) {
      //       reducedState.windows[windowId].schema = schema;
      //     } else {
      //       schemas[windowId] = parseValue(curStateItem.value);
      //     }
      //   } else {
      //     // handle backward-compatible case, before schema was removed from stored window state
      //     const windowId = key.replace('windows::', '');
      //     reducedState.windows[windowId] = parseValue(curStateItem.value);
      //     if (windowId in schemas) {
      //       reducedState.windows[windowId].schema = schemas[windowId];
      //     }
      //   }
      // } else {
      //   reducedState[key] = parseValue(curStateItem.value);
      // }
    });

    if (!Object.keys(reducedState).length) {
      return;
    }

    // console.log('reduced', reducedState);
    // throw new Error('..');
  return reducedState as RootState;
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

    try {
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
        updateSyncOperations(state, nextState, opts.keys as StateKey[], storageNamespace);
        debouncedSyncStateUpdate();
      }
    } catch (error) {
      console.error(new Error('Encountered an error while reducing state in async-storage-sync meta-reducer! :('));
      console.error(error);
    }

    return nextState;
  };
};

// const syncStateUpdate = (oldState: any, newState: any, keys: string[], immediate = false) => {
//   updateSyncOperations(oldState, newState, keys);
//   debouncedSyncStateUpdate();
// };

const parseValue = (value: any) => {
  // store value was historically JSON stringified. Now it is no longer stringified.
  // So we need to handle the backward compatibility
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  return value;
};

const serializeValue = (value: any) => {
  // Remove any item that cannot be serialized with circular references
  const stringify = function(data: any) {
    let cache: any[] = [];

    const output = JSON.stringify(data, function(k, v) {

        if (typeof v === 'object' && v !== null) {
            if (cache.indexOf(v) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(v);
        }

        return v;
    });

    cache = []; // Enable garbage collection

    return output;
}
  // For now we will store the state stringified,
  // until we remove the GraphQLSchema from the state before storing
  // since it isn't a valid value for structured cloning (it is a class instance)
  return JSON.stringify(value);
  return stringify(value);
};
