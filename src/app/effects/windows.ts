import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';

import * as queryActions from '../actions/query/query';
import * as headerActions from '../actions/headers/headers';
import * as variableActions from '../actions/variables/variables';
import * as layoutActions from '../actions/layout/layout';
import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';

import { WindowService } from '../services/window.service';

import { downloadJson, openFile } from '../utils';

@Injectable()
export class WindowsEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  addWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.ADD_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    })
    .switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = [...metaWindowIds, ...windowIds.filter(id => !metaWindowIds.includes(id))]

      return Observable.of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    });

  // Updates windowsMeta with window IDs when a window is removed
  @Effect()
  removeWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.REMOVE_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    })
    .switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = metaWindowIds.filter(id => windowIds.includes(id));
      return Observable.of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    });

  // Exports the window data
  @Effect()
  exportWindow$: Observable<Action> = this.actions$
    .ofType(windowActions.EXPORT_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
    })
    .switchMap(data => {
      this.windowService.getWindowExportData(data.windowId).subscribe(exportData => {
        downloadJson(exportData, data.data.layout.title, { fileType: 'agq' });
      });
      return Observable.empty();
    });

  @Effect()
  importWindow$: Observable<Action> = this.actions$
    .ofType(windowActions.IMPORT_WINDOW)
    .switchMap(action => {
      openFile().then((data: string) => {
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
          this.windowService.newWindow().subscribe(newWindow => {
            const windowId = newWindow.windowId;

            if (parsed.windowName) {
              this.store.dispatch(new layoutActions.SetWindowNameAction(windowId, parsed.windowName));
            }

            if (parsed.apiUrl) {
              this.store.dispatch(new queryActions.SetUrlAction({ url: parsed.apiUrl }, windowId));
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
      });
      return Observable.empty();
    });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private windowService: WindowService
  ) {}
}
