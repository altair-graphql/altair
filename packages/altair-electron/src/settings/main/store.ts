import ElectronStore from 'electron-store';
import {
  SettingStore,
  settingsStoreFileName,
} from '@altairgraphql/electron-interop';

export const store = new ElectronStore<SettingStore>({
  name: settingsStoreFileName,
});
