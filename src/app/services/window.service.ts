import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as uuid from 'uuid/v4';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';

import * as windowActions from '../actions/windows/windows';

import { DbService } from '../services/db.service';

@Injectable()
export class WindowService {

  constructor(
    private db: DbService,
    private store: Store<fromRoot.State>
  ) { }

  newWindow(): Observable<any> {
    return Observable.create((obs: Observer<any>) => {
      return this.store.first().subscribe(data => {

        const newWindow = {
          windowId: uuid(),
          title: `Window ${Object.keys(data.windows).length + 1}`
        };

        this.store.dispatch(new windowActions.AddWindowAction(newWindow));

        obs.next(newWindow);
      });
    });
  }

  removeWindow(windowId): Subscription {
    return this.db.getItem('windows').subscribe(data => {
      data = data || [];

      const newWindows = data.filter(window => window.windowId !== windowId);

      return this.db.setItem('windows', newWindows).subscribe(() => {
        this.db.getAllKeys()
          // Filter out items that are for the current window via the windowId
          .map(keys => keys.filter(key => key.includes(windowId)))
          .subscribe(windowKeys => {
            // Remove all the items related to the current window
            windowKeys.map(key => this.db.removeItemByExactKey(key));

            // Dispatch the remove window action
            return Observable.of(this.store.dispatch(new windowActions.RemoveWindowAction({ windowId })));
          });
      });
    });
  }

  getWindowExportData(windowId): Observable<fromWindows.ExportWindowState> {
    return Observable.create((obs: Observer<fromWindows.ExportWindowState>) => {
      return this.store.first().subscribe(data => {
        const window = { ...data.windows[windowId] };

        // TODO: Check that there is data to be exported

        obs.next({
          version: 1,
          type: 'window',
          query: window.query.query,
          apiUrl: window.query.url,
          variables: window.variables.variables,
          subscriptionUrl: window.query.subscriptionUrl,
          headers: window.headers,
          windowName: window.layout.title
        });
      });
    });
  }
}
