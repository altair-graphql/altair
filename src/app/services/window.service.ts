import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as uuid from 'uuid/v4';

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

  loadWindows(): Observable<any> {
    return this.db.getItem('windows').subscribe(data => {
      if (data && Object.keys(data).length) {
        this.store.dispatch(new windowActions.SetWindowsAction(data));
      } else {
        this.newWindow();
      }
    });
  }

  newWindow(): Observable<any> {
    return this.db.getItem('windows').subscribe(data => {
      data = data || [];

      const newWindowId = uuid();
      const newWindows = [...data, newWindowId];

      return this.db.setItem('windows', newWindows).subscribe(() => {
        return Observable.of(this.store.dispatch(new windowActions.AddWindowAction(newWindowId, 'New window')));
      });
    });
  }

  removeWindow(windowId): Observable<any> {
    return this.db.getItem('windows').subscribe(data => {
      data = data || [];

      const newWindows = data.filter(id => id !== windowId);

      return this.db.setItem('windows', newWindows).subscribe(() => {
        this.db.getAllKeys()
          .map(keys => keys.filter(key => key.includes(windowId)))
          .subscribe(windowKeys => {
            windowKeys.map(key => this.db.removeItemByExactKey(key));

            return Observable.of(this.store.dispatch(new windowActions.RemoveWindowAction(windowId)));
          });
      });
    });
  }
}
