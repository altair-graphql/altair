
import {first} from 'rxjs/operators';
import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';

import { WindowService } from '../window.service';
import { NotifyService } from '../notify/notify.service';

import * as fromRoot from '../../reducers';

import * as queryActions from '../../actions/query/query';
import * as docsActions from '../../actions/docs/docs';
import { debug } from 'app/utils/logger';

@Injectable()
export class ElectronAppService {

  windowIds;
  activeWindowId = '';

  private ipc: Electron.IpcRenderer = window['ipc'];

  constructor(
    private electron: ElectronService,
    private store: Store<fromRoot.State>,
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
      this.ipc.on('file-opened', (evt, content) => {
        this.zone.run(() => this.windowService.importStringData(content));
      });

      this.ipc.on('certificate-error', (evt, error) => {
        this.zone.run(() => this.notifyService.warning(`
          Your request has an invalid certificate.
          You should check that your request is coming from a trusted source.
        `, null, {
          tapToDismiss: true
        }));
      });

      this.ipc.on('create-tab', () => {
        this.zone.run(() => this.windowService.newWindow().pipe(first()).subscribe());
      });
      this.ipc.on('close-tab', () => {
        this.zone.run(() => {
          if (this.windowIds.length > 1) {
            this.windowService.removeWindow(this.activeWindowId);
          }
        });
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

      debug.log('Electron app connected.');

      this.ipc.send('get-file-opened');
    }
  }

  setHeaders(headers) {
    if (this.electron.isElectronApp) {
      this.ipc.sendSync('set-headers-sync', headers);
    }
  }

  isElectronApp() {
    return this.electron.isElectronApp;
  }
}
