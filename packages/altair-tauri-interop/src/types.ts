export interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HeaderState {
  headers: HeaderItem[];
}

export interface SettingsState {
  [key: string]: any;
}

export interface WindowInfo {
  windowId: string;
  title: string;
  url?: string;
  collectionId?: string;
  windowIdInCollection?: string;
  fixedTitle?: boolean;
}

export interface ConnectOptions {
  importFileContent: (content: string) => void;
  createNewWindow: (windowInfo?: Partial<WindowInfo>) => void;
  closeCurrentWindow: () => void;
  openUrl: (url: string) => void;
}

export interface ITauriAPI {
  events: {
    onFileOpened(cb: (content: string) => void): void;
    onUrlOpened(cb: (url: string) => void): void;
    onCreateTab(cb: () => void): void;
    onCloseTab(cb: () => void): void;
    onNextTab(cb: () => void): void;
    onPreviousTab(cb: () => void): void;
    onReopenClosedTab(cb: () => void): void;
    onSendRequest(cb: () => void): void;
    onReloadDocs(cb: () => void): void;
    onShowDocs(cb: () => void): void;
    onShowSettings(cb: () => void): void;
    onImportAppData(cb: (data: string) => void): void;
    onExportAppData(cb: () => void): void;
    onUpdateAvailable(cb: () => void): void;
  };
  
  actions: {
    rendererReady(): void;
    performAppUpdate(): Promise<void>;
    restartApp(): Promise<void>;
    setHeaderSync(headers: HeaderState): Promise<void>;
    getAuthToken(): Promise<string | null>;
    getAutobackupData(): Promise<string | null>;
    saveAutobackupData(data: string): Promise<void>;
    getAltairAppSettingsFromFile(): Promise<SettingsState | null>;
    updateAltairAppSettingsOnFile(settings: SettingsState): Promise<void>;
    importFile(): Promise<string | null>;
    exportFile(data: string, filename?: string): Promise<void>;
    createNewWindow(): Promise<string>;
    closeCurrentWindow(): Promise<void>;
    showNotification(title: string, body: string): Promise<void>;
  };
  
  // Storage API (using Tauri's store plugin)
  storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    length(): Promise<number>;
    key(index: number): Promise<string | null>;
    getStore(): Promise<Record<string, unknown>>;
  };
}