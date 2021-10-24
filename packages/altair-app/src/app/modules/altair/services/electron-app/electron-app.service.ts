
import {first} from 'rxjs/operators';
import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';

import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';

import * as queryActions from '../../store/query/query.action';
import * as docsActions from '../../store/docs/docs.action';
import * as windowsMetaActions from '../../store/windows-meta/windows-meta.action';
import * as windowsActions from '../../store/windows/windows.action';
import { debug } from '../../utils/logger';
import { ObjectLocalStorage } from '../../utils/object-local-storage';
import { getAppStateFromStorage, importIndexedRecords } from '../../store/async-storage-sync';
import { StorageService } from '../storage/storage.service';
import { downloadData } from '../../utils';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ElectronAppService {

  windowIds: string[];
  activeWindowId = '';

  private ipc: Electron.IpcRenderer = (window as any).ipc;

  constructor(
    private electron: ElectronService,
    private store: Store<RootState>,
    private windowService: WindowService,
    private notifyService: NotifyService,
    private zone: NgZone,
  ) {
    this.store.subscribe(data => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    })
  }

  connect() {
    if (this.electron.isElectronApp) {
      this.ipc.on('file-opened', (evt: any, content: string) => {
        this.zone.run(() => this.windowService.importStringData(content));
      });

      this.ipc.on('certificate-error', (evt: any, error: Error) => {
        this.zone.run(() => this.notifyService.warning(`
          Your request has an invalid certificate.
          You should check that your request is coming from a trusted source.
        `));
      });

      this.ipc.on('import-app-data', (evt: any, content: string) => {
        this.zone.run(() => this.importBackupData(content));
      });

      this.ipc.on('export-app-data', () => {
        this.zone.run(() => this.exportBackupData());
      });

      this.ipc.on('create-tab', () => {
        this.zone.run(() => this.windowService.newWindow().pipe(first()).subscribe());
      });
      this.ipc.on('close-tab', () => {
        this.zone.run(() => {
          if (this.windowIds.length > 1) {
            this.windowService.removeWindow(this.activeWindowId).subscribe();
          }
        });
      });

      this.ipc.on('next-tab', () => {
        this.zone.run(() => this.store.dispatch(new windowsMetaActions.SetNextWindowActiveAction()));
      });

      this.ipc.on('previous-tab', () => {
        this.zone.run(() => this.store.dispatch(new windowsMetaActions.SetPreviousWindowAction()));
      });

      this.ipc.on('reopen-closed-tab', () => {
        this.zone.run(() => this.store.dispatch(new windowsActions.ReopenClosedWindowAction()));
      });

      this.ipc.on('send-request', () => {
        this.zone.run(() => this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId)));
      });
      this.ipc.on('reload-docs', () => {
        this.zone.run(() => this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId)));
      });
      this.ipc.on('show-docs', () => {
        this.zone.run(() => this.store.dispatch(new docsActions.ToggleDocsViewAction(this.activeWindowId)));
      });
      this.ipc.on('show-settings', () => {
        this.zone.run(() => this.store.dispatch(new windowsMetaActions.ShowSettingsDialogAction({ value: true })));
      });
      debug.log('Electron app connected.');

      this.ipc.send('get-file-opened');
    }
  }

  setHeaders(headers: HeaderState) {
    if (this.electron.isElectronApp) {
      this.ipc.sendSync('set-headers-sync', headers);
    }
  }

  isElectronApp() {
    return this.electron.isElectronApp;
  }

  restartApp() {
    if (this.electron.isElectronApp) {
      this.ipc.send('restart-app');
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
    const fileObj = JSON.parse(fileContent);
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
      // reload the app
      this.restartApp();
      return location.reload();
    }

    // notify invlaid file content
    return this.notifyService.error('Invalid file content.');
  };

  async exportBackupData () {
    // get store data, in indexedrecords format
    // create data following schema
    // save stringified to file with agbkp extension
    const asyncStorage = new StorageService();
    const stateList = await asyncStorage.appState.toArray();
    const backupData = {
      version: 2,
      indexedrecords: stateList,
    };
    downloadData(JSON.stringify(backupData), 'altair_backup', { fileType: 'agbkp' });
  };
}
