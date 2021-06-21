import { getAltairConfig } from 'altair-graphql-core/build/config';
import performantLocalStorage from '../utils/performant-local-storage';

const getAltairInstanceStorageNamespace = () => getAltairConfig().initialData.instanceStorageNamespace || 'altair_';
export const keySerializer = (key: string) => `${getAltairInstanceStorageNamespace()}${key}`;
export const storageKeys = [ 'windows', 'windowsMeta', 'settings', 'environments' ];

export const localStorageSyncConfig = {
  keys: storageKeys,
  rehydrate: true,
  storage: performantLocalStorage,
  restoreDates: false,
  // syncCondition: (state) => console.log(state),
  storageKeySerializer: keySerializer
} as const;
