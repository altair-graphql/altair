export interface SettingStore {
  settings: {
    proxy_setting:
      | 'none'
      | 'autodetect'
      | 'system'
      | 'pac'
      | 'proxy_server'
      | 'uds_proxy';
    pac_address?: string;
    proxy_host?: string;
    proxy_port?: string;
    socket_path?: string;
  };
  disable_hardware_acceleration: boolean;
}

export const settingsStoreFileName = 'desktop_settings';

export const SETTINGS_STORE_EVENTS = {
  GET_SETTINGS_DATA: 'GET_SETTINGS_DATA',
  UPDATE_SETTINGS_DATA: 'UPDATE_SETTINGS_DATA',
  GET_ALTAIR_APP_SETTINGS: 'GET_ALTAIR_APP_SETTINGS',
  SET_ALTAIR_APP_SETTINGS: 'SET_ALTAIR_APP_SETTINGS',
};

export const altairSettingsStoreFileName = 'altair_settings';
