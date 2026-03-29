import { getAltairConfig } from 'altair-graphql-core/build/config';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import performantLocalStorage from '../utils/performant-local-storage';

const getAltairInstanceStorageNamespace = () =>
  getAltairConfig().options.instanceStorageNamespace || 'altair_';
export const keySerializer = (key: string) =>
  `${getAltairInstanceStorageNamespace()}${key}`;
export const storageKeys: (keyof RootState)[] = [
  'windows',
  'windowsMeta',
  'settings',
  'environments',
  'collectionsMeta',
];

export const localStorageSyncConfig = {
  keys: storageKeys,
  rehydrate: true,
  storage: performantLocalStorage,
  restoreDates: false,
  // syncCondition: (state) => console.log(state),
  storageKeySerializer: keySerializer,
} as const;
