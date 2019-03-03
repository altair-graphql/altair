
import {first} from 'rxjs/operators';
import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';

import { WindowService } from '../window.service';

import * as fromRoot from '../../reducers';

import * as queryActions from '../../actions/query/query';
import * as docsActions from '../../actions/docs/docs';
import { debug } from 'app/utils/logger';

@Injectable()
export class ElectronAppService {

  windowIds;
  activeWindowId = '';

  constructor(
    private electron: ElectronService,
    private store: Store<fromRoot.State>,
    private windowService: WindowService,
    private zone: NgZone,
  ) {
    this.store.subscribe(data => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    })
  }

  connect() {
    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.on('file-opened', (evt, content) => {
        this.zone.run(() => this.windowService.importStringData(content));
      });

      this.electron.ipcRenderer.on('create-tab', () => {
        this.zone.run(() => this.windowService.newWindow().pipe(first()).subscribe());
      });
      this.electron.ipcRenderer.on('close-tab', () => {
        this.zone.run(() => {
          if (this.windowIds.length > 1) {
            this.windowService.removeWindow(this.activeWindowId);
          }
        });
      });

      this.electron.ipcRenderer.on('send-request', () => {
        this.zone.run(() => this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId)));
      });
      this.electron.ipcRenderer.on('reload-docs', () => {
        this.zone.run(() => this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId)));
      });
      this.electron.ipcRenderer.on('show-docs', () => {
        this.zone.run(() => this.store.dispatch(new docsActions.ToggleDocsViewAction(this.activeWindowId)));
      });

      debug.log('Electron app connected.');

      this.electron.ipcRenderer.send('get-file-opened');
    }
  }

  setHeaders(headers) {
    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.sendSync('set-headers-sync', headers);
    }
  }

  isElectronApp() {
    return this.electron.isElectronApp;
  }
}
