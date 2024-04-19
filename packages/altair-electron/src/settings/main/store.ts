import ElectronStore from 'electron-store';
import {
  SettingStore,
  settingsStoreFileName,
  altairSettingsStoreFileName,
} from '@altairgraphql/electron-interop';
import { SettingsState } from 'altair-static';

export const store = new ElectronStore<SettingStore>({
  name: settingsStoreFileName,
});

export const altairSettingsStore = new ElectronStore<SettingsState>({
  name: altairSettingsStoreFileName,
});

export const persistedSettingsStore = new ElectronStore<Partial<SettingsState>>({
  name: 'persisted_settings',
});

export const updateAltairSettingsOnFile = (data: SettingsState) => {
  altairSettingsStore.store = data;
};

export const getAltairSettingsFromFile = (): SettingsState | undefined => {
  return altairSettingsStore.store;
};

export const getPersisedSettingsFromFile = ():
  | Partial<SettingsState>
  | undefined => {
  // TODO: Validate settings
  return persistedSettingsStore.store;
};
