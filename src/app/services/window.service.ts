import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as uuid from 'uuid/v4';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';

import * as queryActions from '../actions/query/query';
import * as headerActions from '../actions/headers/headers';
import * as variableActions from '../actions/variables/variables';
import * as layoutActions from '../actions/layout/layout';
import * as windowActions from '../actions/windows/windows';

import { DbService } from '../services/db.service';

import { getFileStr } from '../utils';

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

  /**
   * Import the window represented by the provided data string
   * @param data window data string
   */
  importWindowData(data: string) {
    try {
      // Verify file's content
      if (!data) {
        throw new Error('File is empty.');
      }
      const parsed: fromWindows.ExportWindowState = JSON.parse(data);
      if (!parsed.version || !parsed.type || parsed.type !== 'window') {
        throw new Error('File is not a valid Altair file.');
      }
      // Importing window data...
      // Add new window
      // Set window name
      // Set API URL
      // Set query
      // Set headers
      // Set variables
      // Set subscription URL
      this.newWindow().subscribe(newWindow => {
        const windowId = newWindow.windowId;

        if (parsed.windowName) {
          this.store.dispatch(new layoutActions.SetWindowNameAction(windowId, parsed.windowName));
        }

        if (parsed.apiUrl) {
          this.store.dispatch(new queryActions.SetUrlAction({ url: parsed.apiUrl }, windowId));
          this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(windowId));
        }

        if (parsed.query) {
          this.store.dispatch(new queryActions.SetQueryAction(parsed.query, windowId));
        }

        if (parsed.headers.length) {
          this.store.dispatch(new headerActions.SetHeadersAction({ headers: parsed.headers }, windowId));
        }

        if (parsed.variables) {
          this.store.dispatch(new variableActions.UpdateVariablesAction(parsed.variables, windowId));
        }

        if (parsed.subscriptionUrl) {
          this.store.dispatch(new queryActions.SetSubscriptionUrlAction({ subscriptionUrl: parsed.subscriptionUrl }, windowId));
        }
      });
    } catch (err) {
      console.log('The file is invalid.', err);
    }
  }

  /**
   * Handle the imported file
   * @param files FilesList object
   */
  handleImportedFile(files) {
    getFileStr(files).then((dataStr: string) => {
      try {
        const parsed = JSON.parse(dataStr);

        if (parsed.type === 'window') {
          this.importWindowData(dataStr);
        }
      } catch (err) {
        console.log('There was an issue importing the file.');
      }
    });
  }
}
