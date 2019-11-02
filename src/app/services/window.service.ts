
import {of as observableOf, Subscription, Observable, Observer } from 'rxjs';

import { first, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as uuid from 'uuid/v4';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';
import * as fromQuery from '../reducers/query/query';

import * as queryActions from '../actions/query/query';
import * as headerActions from '../actions/headers/headers';
import * as variableActions from '../actions/variables/variables';
import * as layoutActions from '../actions/layout/layout';
import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';
import * as preRequestActions from '../actions/pre-request/pre-request';
import * as streamActions from '../actions/stream/stream';
import * as localActions from '../actions/local/local';

import { getFileStr } from '../utils';
import { parseCurlToObj } from '../utils/curl';
import { debug } from 'app/utils/logger';

@Injectable()
export class WindowService {

  constructor(
    private store: Store<fromRoot.State>
  ) { }

  newWindow(opts: { title?, url?, collectionId?, windowIdInCollection? } = {}): Observable<any> {
    return Observable.create((obs: Observer<any>) => {
      return this.store.pipe(first()).subscribe(data => {

        const url = opts.url || fromQuery.initialState.url || (
          data.windowsMeta.activeWindowId &&
          data.windows[data.windowsMeta.activeWindowId] &&
          data.windows[data.windowsMeta.activeWindowId].query.url
        )

        const newWindow = {
          windowId: uuid(),
          title: opts.title || `Window ${Object.keys(data.windows).length + 1}`,
          url,
          collectionId: opts.collectionId,
          windowIdInCollection: opts.windowIdInCollection,
        };

        this.store.dispatch(new windowActions.AddWindowAction(newWindow));

        this.setupWindow(newWindow.windowId);

        obs.next(newWindow);
      });
    });
  }

  removeWindow(windowId) {
    this.cleanupWindow(windowId);

    return this.store.pipe(
      first(),
      tap((data) => {
        const window = data.windows[windowId];
        if (window) {
          this.store.dispatch(new localActions.PushClosedWindowToLocalAction({ window }));
        }
        this.store.dispatch(new windowActions.RemoveWindowAction({ windowId }));
      }),
    ).subscribe();
  }

  duplicateWindow(windowId): Subscription {
    return this.store.pipe(first()).subscribe(data => {
      const window = { ...data.windows[windowId] };

      if (window) {
        const windowData: fromWindows.ExportWindowState = {
          version: 1,
          type: 'window',
          query: window.query.query,
          apiUrl: window.query.url,
          variables: window.variables.variables,
          subscriptionUrl: window.query.subscriptionUrl,
          headers: window.headers,
          windowName: `${window.layout.title} (Copy)`,
          preRequestScript: window.preRequest.script,
          preRequestScriptEnabled: window.preRequest.enabled,
        };

          return this.importWindowData(windowData);
      } else {
        // Todo: throw/flash descriptive message
      }
    });
  }

  getWindowExportData(windowId): Observable<fromWindows.ExportWindowState> {
    return Observable.create((obs: Observer<fromWindows.ExportWindowState>) => {
      return this.store.pipe(first()).subscribe(data => {
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
          windowName: window.layout.title,
          preRequestScript: window.preRequest.script,
          preRequestScriptEnabled: window.preRequest.enabled,
        });
      });
    });
  }

  importWindowDataFromJson(data: string) {
    if (!data) {
      throw new Error('String is empty.');
    }

    try {
      return this.importWindowData(JSON.parse(data));
    } catch (err) {
      try {
        // For a period, the JSON data was URI encoded.
        // Maybe that is the problem with this data.
        debug.log('(Second attempt) Trying to decode JSON data...');
        return this.importWindowData(JSON.parse(decodeURIComponent(data)));
      } catch (err) {}
      debug.log('The file is invalid.', err);
    }
  }

  importWindowDataFromCurl(curlStr: string) {
    if (!curlStr) {
      throw new Error('String is empty.');
    }

    try {
      const curlObj = parseCurlToObj(curlStr);
      const windowData: fromWindows.ExportWindowState = {
        version: 1,
        type: 'window',
        query: curlObj.body ? JSON.parse(curlObj.body).query : '',
        apiUrl: curlObj.url,
        variables: curlObj.body ? JSON.stringify(JSON.parse(curlObj.body).variables) : '',
        subscriptionUrl: '',
        headers: curlObj.headers ? Object.keys(curlObj.headers).map(key => ({ key, value: curlObj.headers[key] })) : [],
        windowName: `cURL-${Date.now()}`,
        preRequestScript: '',
        preRequestScriptEnabled: false,
      };

      return this.importWindowData(windowData);
    } catch (err) {
      debug.log('The file is invalid.', err);
    }
  }

  /**
   * Import the window represented by the provided data string
   * @param data window data string
   */
  importWindowData(data: fromWindows.ExportWindowState) {
    try {
      // Verify file's content
      if (!data) {
        throw new Error('Object is empty.');
      }
      if (!data.version || !data.type || data.type !== 'window') {
        throw new Error('File is not a valid Altair query file.');
      }

      // Importing window data...
      // Add new window
      // Set window name
      // Set API URL
      // Set query
      // Set headers
      // Set variables
      // Set subscription URL
      this.newWindow({
        title: data.windowName,
        url: data.apiUrl,
        collectionId: data.collectionId,
        windowIdInCollection: data.windowIdInCollection,
      }).subscribe(newWindow => {
        const windowId = newWindow.windowId;

        if (data.apiUrl) {
          this.store.dispatch(new queryActions.SetUrlAction({ url: data.apiUrl }, windowId));
          this.store.dispatch(new queryActions.SendIntrospectionQueryRequestAction(windowId));
        }

        if (data.query) {
          this.store.dispatch(new queryActions.SetQueryAction(data.query, windowId));
        }

        if (data.headers.length) {
          this.store.dispatch(new headerActions.SetHeadersAction({ headers: data.headers }, windowId));
        }

        if (data.variables) {
          this.store.dispatch(new variableActions.UpdateVariablesAction(data.variables, windowId));
        }

        if (data.subscriptionUrl) {
          this.store.dispatch(new queryActions.SetSubscriptionUrlAction({ subscriptionUrl: data.subscriptionUrl }, windowId));
        }

        if (data.preRequestScriptEnabled) {
          this.store.dispatch(new preRequestActions.SetPreRequestEnabledAction(windowId, { enabled: data.preRequestScriptEnabled }));
        }
        if (data.preRequestScript) {
          this.store.dispatch(new preRequestActions.SetPreRequestScriptAction(windowId, { script: data.preRequestScript }));
        }

        this.store.dispatch(new windowsMetaActions.SetActiveWindowIdAction({ windowId }));
      });
    } catch (err) {
      debug.log('Something went wrong while importing the data.', err);
    }
  }

  /**
   * Parse data and import as identified type
   * @param dataStr data
   */
  importStringData(dataStr) {
    try {
      const parsed = JSON.parse(dataStr);

      if (parsed.type === 'window') {
        this.importWindowData(parsed);
      }
    } catch (err) {
      debug.log('There was an issue importing the file.');
    }
  }

  /**
   * Handle the imported file
   * @param files FilesList object
   */
  handleImportedFile(files) {
    getFileStr(files).then((dataStr: string) => {
      this.importStringData(dataStr);
    });
  }

  /**
   * Carry out any necessary house cleaning tasks.
   */
  setupWindow(windowId) {
    this.store.dispatch(new queryActions.SetSubscriptionResponseListAction(windowId, { list: [] }));
    this.store.dispatch(new queryActions.StopSubscriptionAction(windowId));
    this.store.dispatch(new streamActions.StopStreamClientAction(windowId));
    this.store.dispatch(new streamActions.StartStreamClientAction(windowId));
  }
  private cleanupWindow(windowId) {
    this.store.dispatch(new queryActions.StopSubscriptionAction(windowId));
    this.store.dispatch(new streamActions.StopStreamClientAction(windowId));
  }
}
