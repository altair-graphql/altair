import { TAURI_COMMAND_NAMES, TAURI_EVENT_NAMES } from './constants';
import { ITauriAPI as ITauriAPIType, HeaderState, SettingsState } from './types';

// We'll use dynamic imports and window object to access Tauri APIs at runtime
// This avoids build-time dependencies on Tauri packages

export const tauriApi: ITauriAPIType = {
  events: {
    onFileOpened(cb: (content: string) => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.FILE_OPENED, (event: any) => {
          if (typeof event.payload === 'string') {
            cb(event.payload);
          }
        });
      }
    },

    onUrlOpened(cb: (url: string) => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.URL_OPENED, (event: any) => {
          if (typeof event.payload === 'string') {
            cb(event.payload);
          }
        });
      }
    },

    onCreateTab(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.CREATE_TAB, () => cb());
      }
    },

    onCloseTab(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.CLOSE_TAB, () => cb());
      }
    },

    onNextTab(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.NEXT_TAB, () => cb());
      }
    },

    onPreviousTab(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.PREVIOUS_TAB, () => cb());
      }
    },

    onReopenClosedTab(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.REOPEN_CLOSED_TAB, () => cb());
      }
    },

    onSendRequest(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.SEND_REQUEST, () => cb());
      }
    },

    onReloadDocs(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.RELOAD_DOCS, () => cb());
      }
    },

    onShowDocs(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.SHOW_DOCS, () => cb());
      }
    },

    onShowSettings(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.SHOW_SETTINGS, () => cb());
      }
    },

    onImportAppData(cb: (data: string) => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.IMPORT_APP_DATA, (event: any) => {
          if (typeof event.payload === 'string') {
            cb(event.payload);
          }
        });
      }
    },

    onExportAppData(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.EXPORT_APP_DATA, () => cb());
      }
    },

    onUpdateAvailable(cb: () => void) {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        tauri.event.listen(TAURI_EVENT_NAMES.UPDATE_AVAILABLE, () => cb());
      }
    },
  },

  actions: {
    rendererReady() {
      // In Tauri, we don't need to explicitly signal renderer ready
      console.log('Tauri renderer ready');
    },

    async performAppUpdate(): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.PERFORM_APP_UPDATE);
      }
      throw new Error('Not in Tauri environment');
    },

    async restartApp(): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.RESTART_APP);
      }
      throw new Error('Not in Tauri environment');
    },

    async setHeaderSync(headers: HeaderState): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.SET_HEADERS, { headers });
      }
      throw new Error('Not in Tauri environment');
    },

    async getAuthToken(): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.GET_AUTH_TOKEN);
      }
      return null;
    },

    async getAutobackupData(): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.GET_AUTOBACKUP_DATA);
      }
      return null;
    },

    async saveAutobackupData(data: string): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.SAVE_AUTOBACKUP_DATA, { data });
      }
      throw new Error('Not in Tauri environment');
    },

    async getAltairAppSettingsFromFile(): Promise<SettingsState | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.GET_ALTAIR_APP_SETTINGS_FROM_FILE);
      }
      return null;
    },

    async updateAltairAppSettingsOnFile(settings: SettingsState): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.UPDATE_ALTAIR_APP_SETTINGS_ON_FILE, { settings });
      }
      throw new Error('Not in Tauri environment');
    },

    async importFile(): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.IMPORT_FILE);
      }
      return null;
    },

    async exportFile(data: string, filename?: string): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.EXPORT_FILE, { data, filename });
      }
      throw new Error('Not in Tauri environment');
    },

    async createNewWindow(): Promise<string> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.CREATE_NEW_WINDOW);
      }
      throw new Error('Not in Tauri environment');
    },

    async closeCurrentWindow(): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.CLOSE_CURRENT_WINDOW);
      }
      throw new Error('Not in Tauri environment');
    },

    async showNotification(title: string, body: string): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const tauri = (window as any).__TAURI__;
        return tauri.core.invoke(TAURI_COMMAND_NAMES.SHOW_NOTIFICATION, { title, body });
      }
      throw new Error('Not in Tauri environment');
    },
  },

  storage: {
    async getItem(key: string): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        // Use Tauri's built-in store when available
        // For now, fallback to localStorage
        const value = localStorage.getItem(key);
        return value;
      }
      return null;
    },

    async setItem(key: string, value: string): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        localStorage.setItem(key, value);
      } else {
        throw new Error('Not in Tauri environment');
      }
    },

    async removeItem(key: string): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        localStorage.removeItem(key);
      } else {
        throw new Error('Not in Tauri environment');
      }
    },

    async clear(): Promise<void> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        localStorage.clear();
      } else {
        throw new Error('Not in Tauri environment');
      }
    },

    async length(): Promise<number> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        return localStorage.length;
      }
      return 0;
    },

    async key(index: number): Promise<string | null> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        return localStorage.key(index);
      }
      return null;
    },

    async getStore(): Promise<Record<string, unknown>> {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const store: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            store[key] = localStorage.getItem(key);
          }
        }
        return store;
      }
      return {};
    },
  },
};

export type ITauriAPI = typeof tauriApi;