import { distinctUntilChanged, take } from 'rxjs/operators';
import { Injectable, NgZone, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { init } from '@sentry/electron/renderer';

import { NotifyService } from '../notify/notify.service';

import * as queryActions from '../../store/query/query.action';
import * as docsActions from '../../store/docs/docs.action';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';
import * as windowsActions from '../../store/windows/windows.action';
import { debug } from '../../utils/logger';
import { ObjectLocalStorage } from '../../utils/object-local-storage';
import {
  getAppStateFromStorage,
  importIndexedRecords,
} from '../../store/async-storage-sync';
import { StorageService } from '../storage/storage.service';
import { downloadData, isElectronApp } from '../../utils';
import { selectShowDocs } from '../../store/docs/selectors';
import { isTauri } from '@altairgraphql/tauri';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import {
  electronAPI,
  InteropAppState,
} from '@altairgraphql/electron-interop/build/renderer';
import { environment } from 'environments/environment';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { IdentityProvider } from '@altairgraphql/db';
import { partialSettingsSchema } from 'altair-graphql-core/build/types/state/settings.schema';

interface ConnectOptions {
  importFileContent: (content: string) => void;
  createNewWindow: () => void;
  closeCurrentWindow: () => void;
  openUrl: (url: string) => void;
}

interface BackupDataV1 {
  version: 1;
  localstore: IDictionary;
}
interface BackupDataV2 {
  version: 2;
  indexedrecords: {
    key: string;
    value: unknown;
  }[];
  collections?: IQueryCollection[];
}

const BACKUP_INTERVAL_MINUTES = 60;

@Injectable({
  providedIn: 'root',
})
export class ElectronAppService {
  private store = inject<Store<RootState>>(Store);
  private notifyService = inject(NotifyService);
  private storageService = inject(StorageService);
  private zone = inject(NgZone);

  activeWindowId = '';

  private api = electronAPI;

  private lastBackupTs = Date.now();

  constructor() {
    this.store
      .select((state) => state.windowsMeta.activeWindowId)
      .pipe(distinctUntilChanged())
      .subscribe((activeWindowId) => {
        this.activeWindowId = activeWindowId;
        this.api?.actions.updateInteropActiveWindowIdState(activeWindowId);
      });

    // TODO: Consider splitting up to only send diffs instead of whole state. Maybe use an effects class to listen to specific changes and send only those.
    this.store
      .select((state): InteropAppState => {
        const interopState: InteropAppState = {
          windows: {},
          activeWindowId: state.windowsMeta.activeWindowId,
        };
        Object.keys(state.windows).forEach((windowId) => {
          const window = state.windows[windowId];
          if (!window) {
            return;
          }
          interopState.windows[windowId] = {
            windowId,
            headers: window.headers,
            showDocs: selectShowDocs(window),
          };
        });
        return interopState;
      })
      .pipe(distinctUntilChanged())
      .subscribe((interopAppState) => {
        this.api?.actions.updateInteropState(interopAppState);
      });

    // subscribe to storage changes
    this.storageService.changes().subscribe(async () => {
      const now = Date.now();
      if (now - this.lastBackupTs >= BACKUP_INTERVAL_MINUTES * 60 * 1000) {
        // run backup..
        const data = await this.generateBackupData();
        // Send to main process to store..
        this.api?.actions.saveAutobackupData(data);
        this.lastBackupTs = now;
      }
    });
  }

  connect({
    importFileContent,
    createNewWindow,
    closeCurrentWindow,
    openUrl,
  }: ConnectOptions) {
    if (!isElectronApp() || !this.api) {
      return;
    }

    init({
      release: environment.version,
    });

    this.api.events.onFileOpened((content) => {
      this.zone.run(() => importFileContent(content));
    });
    this.api.events.onUrlOpened((url) => {
      this.zone.run(() => openUrl(url));
    });

    this.api.events.onCertificateError(() => {
      this.zone.run(() =>
        this.notifyService.warning(`
        Your request has an invalid certificate.
        You should check that your request is coming from a trusted source.
      `)
      );
    });

    this.api.events.onImportAppData((content) => {
      this.zone.run(() => this.importBackupData(content));
    });

    this.api.events.onExportAppData(() => {
      this.zone.run(() => this.exportBackupData());
    });

    this.api.events.onCreateTab(() => {
      this.zone.run(() => createNewWindow());
    });

    this.api.events.onCloseTab(() => {
      this.zone.run(() => closeCurrentWindow());
    });

    this.api.events.onNextTab(() => {
      this.zone.run(() =>
        this.store.dispatch(new windowsMetaActions.SetNextWindowActiveAction())
      );
    });

    this.api.events.onPreviousTab(() => {
      this.zone.run(() =>
        this.store.dispatch(new windowsMetaActions.SetPreviousWindowAction())
      );
    });

    this.api.events.onReopenClosedTab(() => {
      this.zone.run(() =>
        this.store.dispatch(new windowsActions.ReopenClosedWindowAction())
      );
    });

    this.api.events.onSendRequest(() => {
      this.zone.run(() =>
        this.store.dispatch(
          new queryActions.SendQueryRequestAction(this.activeWindowId)
        )
      );
    });

    this.api.events.onReloadDocs(() => {
      this.zone.run(() =>
        this.store.dispatch(
          new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId)
        )
      );
    });

    this.api.events.onShowDocs(() => {
      this.zone.run(() =>
        this.store.dispatch(
          new docsActions.ToggleDocsViewAction(this.activeWindowId)
        )
      );
    });

    this.api.events.onShowSettings(() => {
      this.zone.run(() =>
        this.store.dispatch(
          new windowsMetaActions.ShowSettingsDialogAction({ value: true })
        )
      );
    });

    debug.log('Electron app connected.');

    this.api.actions.rendererReady();

    this.store
      .select(
        (state: RootState) => state.settings['alert.disableUpdateNotification']
      )
      .pipe(take(1))
      .subscribe((disableUpdateNotification) => {
        if (!disableUpdateNotification) {
          this.initUpdateAvailableHandler();
        }
      });
  }

  getAuthToken(provider: IdentityProvider) {
    return this.api?.actions.getAuthToken(provider);
  }

  getAutobackupData() {
    return this.api?.actions.getAutobackupData();
  }

  async importAutobackupData() {
    try {
      const data = await this.getAutobackupData();

      if (!data) {
        return;
      }

      await this.importBackupData(data);
      return true;
    } catch (err) {
      debug.error(err);
      return false;
    }
  }

  private initUpdateAvailableHandler() {
    if (!isElectronApp() || !this.api) {
      return;
    }
    const opts = {
      disableTimeOut: true,
      data: {
        action: () => {
          if (!isElectronApp() || !this.api) {
            return;
          }

          this.api.actions.performAppUpdate();
        },
      },
    };
    this.api.events.onUpdateAvailable(() => {
      this.notifyService.info(
        'Click here to download the latest version!',
        'Update Found!',
        opts
      );
    });
  }

  isElectronApp() {
    const isElectron = !!window.navigator.userAgent.match(/Electron/);

    if (!isElectron) {
      return false;
    }

    if (!this.api) {
      debug.error('Is in electron app but IPC is undefined!');
      return false;
    }

    return true;
  }

  restartApp() {
    if (isElectronApp() && this.api) {
      this.api.actions.restartApp();
    }
  }

  /**
   * Backup file structure
   * -----------
   * {
   *  version: 1,
   *  localstore: <localstorage data>
   * }
   * {
   *  version: 2,
   *  indexedrecords: <indexed key-value pair list>
   * }
   */

  async importBackupData(fileContent: string) {
    // get JSON
    // check version 1 of file

    if (!fileContent) {
      // notify invalid file
      return this.notifyService.error('Invalid file');
    }
    const fileObj: BackupDataV1 | BackupDataV2 = JSON.parse(fileContent);
    if (fileObj.version === 1 && fileObj.localstore) {
      const localStorage = new ObjectLocalStorage(fileObj.localstore);
      // set the data to store
      await getAppStateFromStorage({
        updateFromLocalStorage: true,
        forceUpdateFromProvidedData: true,
        storage: localStorage,
      });
      // reload the app
      this.restartApp();
      return location.reload();
    }

    if (fileObj.version === 2 && fileObj.indexedrecords) {
      // Set indexedDb data
      await importIndexedRecords(fileObj.indexedrecords);

      if (fileObj.collections) {
        await this.storageService.queryCollections.bulkAdd(fileObj.collections);
      }

      // reload the app
      this.restartApp();
      return location.reload();
    }

    // notify invlaid file content
    return this.notifyService.error('Invalid file content.');
  }

  async generateBackupData() {
    // get store data, in indexedrecords format
    // create data following schema
    // save stringified to file with agbkp extension
    const asyncStorage = new StorageService();
    const stateList = await asyncStorage.appState.toArray();
    const backupData: BackupDataV2 = {
      version: 2,
      indexedrecords: stateList,
      collections: await asyncStorage.queryCollections.toArray(),
    };

    return JSON.stringify(backupData);
  }

  async exportBackupData() {
    downloadData(await this.generateBackupData(), 'altair_backup', {
      fileType: 'agbkp',
    });
  }

  async getSettingsFromFile() {
    const data = await this.api?.actions.getAltairAppSettingsFromFile();
    if (!data) {
      return;
    }
    return partialSettingsSchema.parse(data);
  }

  updateSettingsOnFile(settings: SettingsState) {
    return this.api?.actions.updateAltairAppSettingsOnFile(settings);
  }
}
