import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { IdentityProvider } from 'altair-graphql-core/build/identity/providers';
import { ipcRenderer } from 'electron';
import { IPC_EVENT_NAMES, STORE_EVENTS } from './constants';
import { SETTINGS_STORE_EVENTS } from './settings';
import { InteropAppState } from './types';

const decodeError = (errObj: {
  name: string;
  message: string;
  extra?: Record<string, unknown>;
}) => {
  const e = new Error(errObj.message);
  e.name = errObj.name;
  Object.assign(e, errObj.extra);
  return e;
};

const invokeWithCustomErrors = async (channel: string, ...args: unknown[]) => {
  const { error, result } = await ipcRenderer.invoke(channel, ...args);
  if (error) {
    throw decodeError(error);
  }
  return result;
};

export const electronApi = {
  events: {
    onFileOpened(cb: (content: string) => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.FILE_OPENED, (evt, data: string) =>
        cb(data)
      );
    },
    onUrlOpened(cb: (url: string) => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.URL_OPENED, (evt, url: string) =>
        cb(url)
      );
    },
    onCertificateError(cb: (err: Error) => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.CERTIFICATE_ERROR, (evt, err: Error) =>
        cb(err)
      );
    },
    onImportAppData(cb: (content: string) => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.IMPORT_APP_DATA, (evt, data: string) =>
        cb(data)
      );
    },
    onExportAppData(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.EXPORT_APP_DATA, () => cb());
    },
    onCreateTab(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.CREATE_TAB, () => cb());
    },
    onCloseTab(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.CLOSE_TAB, () => cb());
    },
    onNextTab(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.NEXT_TAB, () => cb());
    },
    onPreviousTab(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.PREVIOUS_TAB, () => cb());
    },
    onReopenClosedTab(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.REOPEN_CLOSED_TAB, () => cb());
    },
    onSendRequest(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.SEND_REQUEST, () => cb());
    },
    onReloadDocs(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.RELOAD_DOCS, () => cb());
    },
    onShowDocs(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.SHOW_DOCS, () => cb());
    },
    onShowSettings(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.SHOW_SETTINGS, () => cb());
    },
    onUpdateAvailable(cb: () => void) {
      return ipcRenderer.on(IPC_EVENT_NAMES.UPDATE_AVAILABLE, () => cb());
    },
  },
  store: {
    clear(): void {
      ipcRenderer.sendSync(STORE_EVENTS.CLEAR);
    },

    getItem(key: string): string | null {
      return ipcRenderer.sendSync(STORE_EVENTS.GET_ITEM, key);
    },

    key(index: number): string | null {
      return ipcRenderer.sendSync(STORE_EVENTS.KEY_BY_INDEX, index);
    },

    removeItem(key: string): void {
      return ipcRenderer.sendSync(STORE_EVENTS.REMOVE_ITEM, key);
    },

    setItem(key: string, value: string): void {
      return ipcRenderer.sendSync(STORE_EVENTS.SET_ITEM, key, value);
    },

    getLength(): number {
      return ipcRenderer.sendSync(STORE_EVENTS.LENGTH);
    },
    getStore(): Record<string, unknown> {
      return ipcRenderer.sendSync(STORE_EVENTS.GET_STORE_OBJECT);
    },
  },
  actions: {
    rendererReady() {
      return ipcRenderer.send(IPC_EVENT_NAMES.RENDERER_READY);
    },
    performAppUpdate() {
      return ipcRenderer.send(IPC_EVENT_NAMES.RENDERER_UPDATE_APP);
    },
    restartApp() {
      return ipcRenderer.send(IPC_EVENT_NAMES.RENDERER_RESTART_APP);
    },
    getAuthToken(provider: IdentityProvider) {
      return invokeWithCustomErrors(
        IPC_EVENT_NAMES.RENDERER_GET_AUTH_TOKEN,
        provider
      );
    },
    getAutobackupData() {
      return invokeWithCustomErrors(IPC_EVENT_NAMES.RENDERER_GET_AUTOBACKUP_DATA);
    },
    saveAutobackupData(data: string) {
      return ipcRenderer.send(IPC_EVENT_NAMES.RENDERER_SAVE_AUTOBACKUP_DATA, data);
    },
    updateInteropState(state: InteropAppState) {
      return ipcRenderer.send(IPC_EVENT_NAMES.RENDERER_SET_INTEROP_APP_STATE, state);
    },
    updateInteropWindowState(
      windowId: string,
      state: Partial<InteropAppState['windows'][string]>
    ) {
      return ipcRenderer.send(
        IPC_EVENT_NAMES.RENDERER_SET_INTEROP_WINDOW_STATE,
        windowId,
        state
      );
    },
    updateInteropActiveWindowIdState(windowId: string) {
      return ipcRenderer.send(
        IPC_EVENT_NAMES.RENDERER_SET_INTEROP_ACTIVE_WINDOW_ID_STATE,
        windowId
      );
    },
    removeInteropWindowState(windowId: string) {
      return ipcRenderer.send(
        IPC_EVENT_NAMES.RENDERER_REMOVE_INTEROP_WINDOW_STATE,
        windowId
      );
    },

    getAltairAppSettingsFromFile(): Promise<SettingsState | undefined> {
      return invokeWithCustomErrors(SETTINGS_STORE_EVENTS.GET_ALTAIR_APP_SETTINGS);
    },
    updateAltairAppSettingsOnFile(settings: SettingsState) {
      return invokeWithCustomErrors(
        SETTINGS_STORE_EVENTS.SET_ALTAIR_APP_SETTINGS,
        settings
      );
    },
  },
};

export type IElectronAPI = typeof electronApi;
