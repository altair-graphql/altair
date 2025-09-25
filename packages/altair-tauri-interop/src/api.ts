import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Store } from '@tauri-apps/plugin-store';
import { TAURI_COMMAND_NAMES, TAURI_EVENT_NAMES } from './constants';
import { ITauriAPI, HeaderState, SettingsState } from './types';

// Initialize the store
let store: Store;
const initStore = async () => {
  if (!store) {
    store = new Store('altair-store.json');
  }
  return store;
};

export const tauriApi: ITauriAPI = {
  events: {
    onFileOpened(cb: (content: string) => void) {
      listen(TAURI_EVENT_NAMES.FILE_OPENED, (event) => {
        if (typeof event.payload === 'string') {
          cb(event.payload);
        }
      });
    },

    onUrlOpened(cb: (url: string) => void) {
      listen(TAURI_EVENT_NAMES.URL_OPENED, (event) => {
        if (typeof event.payload === 'string') {
          cb(event.payload);
        }
      });
    },

    onCreateTab(cb: () => void) {
      listen(TAURI_EVENT_NAMES.CREATE_TAB, () => cb());
    },

    onCloseTab(cb: () => void) {
      listen(TAURI_EVENT_NAMES.CLOSE_TAB, () => cb());
    },

    onNextTab(cb: () => void) {
      listen(TAURI_EVENT_NAMES.NEXT_TAB, () => cb());
    },

    onPreviousTab(cb: () => void) {
      listen(TAURI_EVENT_NAMES.PREVIOUS_TAB, () => cb());
    },

    onReopenClosedTab(cb: () => void) {
      listen(TAURI_EVENT_NAMES.REOPEN_CLOSED_TAB, () => cb());
    },

    onSendRequest(cb: () => void) {
      listen(TAURI_EVENT_NAMES.SEND_REQUEST, () => cb());
    },

    onReloadDocs(cb: () => void) {
      listen(TAURI_EVENT_NAMES.RELOAD_DOCS, () => cb());
    },

    onShowDocs(cb: () => void) {
      listen(TAURI_EVENT_NAMES.SHOW_DOCS, () => cb());
    },

    onShowSettings(cb: () => void) {
      listen(TAURI_EVENT_NAMES.SHOW_SETTINGS, () => cb());
    },

    onImportAppData(cb: (data: string) => void) {
      listen(TAURI_EVENT_NAMES.IMPORT_APP_DATA, (event) => {
        if (typeof event.payload === 'string') {
          cb(event.payload);
        }
      });
    },

    onExportAppData(cb: () => void) {
      listen(TAURI_EVENT_NAMES.EXPORT_APP_DATA, () => cb());
    },

    onUpdateAvailable(cb: () => void) {
      listen(TAURI_EVENT_NAMES.UPDATE_AVAILABLE, () => cb());
    },
  },

  actions: {
    rendererReady() {
      // In Tauri, we don't need to explicitly signal renderer ready
      // The app starts when ready
      console.log('Tauri renderer ready');
    },

    async performAppUpdate(): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.PERFORM_APP_UPDATE);
    },

    async restartApp(): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.RESTART_APP);
    },

    async setHeaderSync(headers: HeaderState): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.SET_HEADERS, { headers });
    },

    async getAuthToken(): Promise<string | null> {
      return invoke(TAURI_COMMAND_NAMES.GET_AUTH_TOKEN);
    },

    async getAutobackupData(): Promise<string | null> {
      return invoke(TAURI_COMMAND_NAMES.GET_AUTOBACKUP_DATA);
    },

    async saveAutobackupData(data: string): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.SAVE_AUTOBACKUP_DATA, { data });
    },

    async getAltairAppSettingsFromFile(): Promise<SettingsState | null> {
      return invoke(TAURI_COMMAND_NAMES.GET_ALTAIR_APP_SETTINGS_FROM_FILE);
    },

    async updateAltairAppSettingsOnFile(settings: SettingsState): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.UPDATE_ALTAIR_APP_SETTINGS_ON_FILE, { settings });
    },

    async importFile(): Promise<string | null> {
      return invoke(TAURI_COMMAND_NAMES.IMPORT_FILE);
    },

    async exportFile(data: string, filename?: string): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.EXPORT_FILE, { data, filename });
    },

    async createNewWindow(): Promise<string> {
      return invoke(TAURI_COMMAND_NAMES.CREATE_NEW_WINDOW);
    },

    async closeCurrentWindow(): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.CLOSE_CURRENT_WINDOW);
    },

    async showNotification(title: string, body: string): Promise<void> {
      return invoke(TAURI_COMMAND_NAMES.SHOW_NOTIFICATION, { title, body });
    },
  },

  storage: {
    async getItem(key: string): Promise<string | null> {
      const store = await initStore();
      const value = await store.get<string>(key);
      return value ?? null;
    },

    async setItem(key: string, value: string): Promise<void> {
      const store = await initStore();
      await store.set(key, value);
      await store.save();
    },

    async removeItem(key: string): Promise<void> {
      const store = await initStore();
      await store.delete(key);
      await store.save();
    },

    async clear(): Promise<void> {
      const store = await initStore();
      await store.clear();
      await store.save();
    },

    async length(): Promise<number> {
      const store = await initStore();
      const entries = await store.entries();
      return entries.length;
    },

    async key(index: number): Promise<string | null> {
      const store = await initStore();
      const entries = await store.entries();
      if (index >= 0 && index < entries.length) {
        return entries[index][0];
      }
      return null;
    },

    async getStore(): Promise<Record<string, unknown>> {
      const store = await initStore();
      const entries = await store.entries();
      return Object.fromEntries(entries);
    },
  },
};

export type ITauriAPI = typeof tauriApi;