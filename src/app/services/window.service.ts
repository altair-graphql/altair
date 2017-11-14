import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as uuid from 'uuid/v4';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';

import * as windowActions from '../actions/windows/windows';

import { DbService } from '../services/db.service';

@Injectable()
export class WindowService {

  constructor(
    private db: DbService,
    private store: Store<fromRoot.State>
  ) { }

  loadWindows(): Subscription {
    return this.db.getItem('windows').subscribe(data => {
      if (data && Object.keys(data).length) {
        this.store.dispatch(new windowActions.SetWindowsAction(data));
      } else {
        this.newWindow();
      }
    });
  }

  newWindow(): Subscription {
    return this.db.getItem('windows').subscribe(data => {
      data = data || [];

      const newWindow = {
        windowId: uuid(),
        title: `Window ${data.length + 1}`
      };

      const newWindows = [...data, newWindow];

      return this.db.setItem('windows', newWindows).subscribe(() => {
        return Observable.of(this.store.dispatch(new windowActions.AddWindowAction(newWindow)));
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
            return Observable.of(this.store.dispatch(new windowActions.RemoveWindowAction(windowId)));
          });
      });
    });
  }
}
