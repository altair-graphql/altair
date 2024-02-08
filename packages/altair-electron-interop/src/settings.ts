export interface SettingStore {
  settings: {
    proxy_setting: 'none' | 'autodetect' | 'system' | 'pac' | 'proxy_server';
    pac_address?: string;
    proxy_host?: string;
    proxy_port?: string;
  };
}

export const settingsStoreFileName = 'desktop_settings';

export const SETTINGS_STORE_EVENTS = {
  GET_SETTINGS_DATA: 'GET_SETTINGS_DATA',
  UPDATE_SETTINGS_DATA: 'UPDATE_SETTINGS_DATA',
};
