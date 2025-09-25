// Constants for Tauri events and commands
export const TAURI_COMMAND_NAMES = {
  // Window management
  CREATE_NEW_WINDOW: 'create_new_window',
  CLOSE_CURRENT_WINDOW: 'close_current_window',
  
  // File operations
  IMPORT_FILE: 'import_file',
  EXPORT_FILE: 'export_file',
  
  // Application lifecycle
  RESTART_APP: 'restart_app',
  PERFORM_APP_UPDATE: 'perform_app_update',
  
  // Headers
  SET_HEADERS: 'set_headers',
  
  // Authentication
  GET_AUTH_TOKEN: 'get_auth_token',
  
  // Data persistence
  GET_AUTOBACKUP_DATA: 'get_autobackup_data',
  SAVE_AUTOBACKUP_DATA: 'save_autobackup_data',
  
  // Settings
  GET_ALTAIR_APP_SETTINGS_FROM_FILE: 'get_altair_app_settings_from_file',
  UPDATE_ALTAIR_APP_SETTINGS_ON_FILE: 'update_altair_app_settings_on_file',
  
  // Notifications
  SHOW_NOTIFICATION: 'show_notification',
} as const;

export const TAURI_EVENT_NAMES = {
  // File events
  FILE_OPENED: 'file-opened',
  URL_OPENED: 'url-opened',
  
  // Tab management
  CREATE_TAB: 'create-tab',
  CLOSE_TAB: 'close-tab',
  NEXT_TAB: 'next-tab',
  PREVIOUS_TAB: 'previous-tab',
  REOPEN_CLOSED_TAB: 'reopen-closed-tab',
  
  // Request management
  SEND_REQUEST: 'send-request',
  RELOAD_DOCS: 'reload-docs',
  SHOW_DOCS: 'show-docs',
  SHOW_SETTINGS: 'show-settings',
  
  // Updates
  UPDATE_AVAILABLE: 'update-available',
  
  // Import/Export
  IMPORT_APP_DATA: 'import-app-data',
  EXPORT_APP_DATA: 'export-app-data',
} as const;

export const ALTAIR_CUSTOM_PROTOCOL = 'altair';

export const tauriApiKey = 'tauriApi';

// Allowed headers that can be modified (similar to electron version)
export const TAURI_ALLOWED_FORBIDDEN_HEADERS = [
  'origin',
  'cookie',
  'referer',
].map((_) => _.toLowerCase());