import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';

import { WindowService } from '..';

import * as fromRoot from '../../reducers';

import * as queryActions from '../../actions/query/query';
import * as docsActions from '../../actions/docs/docs';

@Injectable()
export class ElectronAppService {

  windowIds;
  activeWindowId = '';

  constructor(
    private electron: ElectronService,
    private store: Store<fromRoot.State>,
    private windowService: WindowService,
  ) {
    this.store.subscribe(data => {
      this.windowIds = Object.keys(data.windows);
      this.activeWindowId = data.windowsMeta.activeWindowId;
    })
  }

  connect() {
    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.on('create-tab', () => {
        this.windowService.newWindow().first().subscribe();
      });
      this.electron.ipcRenderer.on('close-tab', () => {
        if (this.windowIds.length > 1) {
          this.windowService.removeWindow(this.activeWindowId);
        }
      });

      this.electron.ipcRenderer.on('send-request', () => {
        this.store.dispatch(new queryActions.SendQueryRequestAction(this.activeWindowId));
      });
      this.electron.ipcRenderer.on('reload-docs', () => {
        this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(this.activeWindowId));
      });
      this.electron.ipcRenderer.on('show-docs', () => {
        this.store.dispatch(new docsActions.ToggleDocsViewAction(this.activeWindowId));
      });

      console.log('Electron app connected.');
    }
  }
}
