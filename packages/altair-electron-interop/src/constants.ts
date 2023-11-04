export const IPC_EVENT_NAMES = {
  FILE_OPENED: 'file-opened',
  CERTIFICATE_ERROR: 'certificate-error',
  IMPORT_APP_DATA: 'import-app-data',
  EXPORT_APP_DATA: 'export-app-data',
  CREATE_TAB: 'create-tab',
  CLOSE_TAB: 'close-tab',
  NEXT_TAB: 'next-tab',
  PREVIOUS_TAB: 'previous-tab',
  REOPEN_CLOSED_TAB: 'reopen-closed-tab',
  SEND_REQUEST: 'send-request',
  RELOAD_DOCS: 'reload-docs',
  SHOW_DOCS: 'show-docs',
  SHOW_SETTINGS: 'show-settings',
  GET_FILE_OPENED: 'get-file-opened',
  UPDATE_AVAILABLE: 'update-available',
  RENDERER_READY: 'from-renderer:ready',
  RENDERER_UPDATE_APP: 'from-renderer:update-app',
  RENDERER_RESTART_APP: 'from-renderer:restart-app',
  RENDERER_SET_HEADERS_SYNC: 'from-renderer:set-headers-sync',
  RENDERER_GET_AUTOBACKUP_DATA: 'from-renderer:get-auto-backup',
  RENDERER_SAVE_AUTOBACKUP_DATA: 'from-renderer:save-auto-backup',
  RENDERER_GET_AUTH_TOKEN: 'from-renderer:get-auth-token',
};
export const STORE_EVENTS = {
  LENGTH: 'electron-store:length',
  CLEAR: 'electron-store:clear',
  GET_ITEM: 'electron-store:getItem',
  KEY_BY_INDEX: 'electron-store:keyByIndex',
  REMOVE_ITEM: 'electron-store:removeItem',
  SET_ITEM: 'electron-store:setItem',
  GET_STORE_OBJECT: 'electron-store:getStoreObject',
};

export const electronApiKey = 'electronApi';

// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
export const ELECTRON_ALLOWED_FORBIDDEN_HEADERS = [
  'origin',
  'cookie',
  'referer',
].map(_ => _.toLowerCase());
