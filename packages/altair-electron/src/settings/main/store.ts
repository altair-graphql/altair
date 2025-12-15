import ElectronStore from 'electron-store';
import {
  SettingStore,
  settingsStoreFileName,
  altairSettingsStoreFileName,
} from '@altairgraphql/electron-interop';
import validatePartialSettings from 'altair-graphql-core/build/typegen/validate-partial-settings';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';

export const store = new ElectronStore<SettingStore>({
  name: settingsStoreFileName,
  defaults: {
    settings: {
      proxy_setting: 'none',
    },
    disable_hardware_acceleration: false,
  },
});

export const altairSettingsStore = new ElectronStore<SettingsState>({
  name: altairSettingsStoreFileName,
});

export const persistedSettingsStore = new ElectronStore({
  name: 'persisted_settings',
});

export const updateAltairSettingsOnFile = (data: SettingsState) => {
  altairSettingsStore.store = data;
};

export const getAltairSettingsFromFile = (): SettingsState | undefined => {
  return altairSettingsStore.store;
};

export const getPersisedSettingsFromFile = () => {
  const data = persistedSettingsStore.store;
  // Validate settings
  if (validatePartialSettings(data)) {
    return data;
  }
};
