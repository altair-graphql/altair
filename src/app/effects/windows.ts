
import {empty as observableEmpty, of as observableOf,  Observable } from 'rxjs';

import {switchMap, withLatestFrom, tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, ofType } from '@ngrx/effects';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';

import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';
import * as localActions from '../actions/local/local';

import { WindowService } from '../services/window.service';

import { downloadJson, openFile } from '../utils';

@Injectable()
export class WindowsEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  addWindowID$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.ADD_WINDOW),
      withLatestFrom(this.store, (action: windowActions.AddWindowAction, state) => {
        return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
      }),
      switchMap(data => {
        const windowIds = Object.keys(data.windows);
        const metaWindowIds = data.windowIds;
        const newWindowIds = [...metaWindowIds, ...windowIds.filter(id => !metaWindowIds.includes(id))]

        return observableOf(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
      }),
    );

  // Updates windowsMeta with window IDs when a window is removed
  @Effect()
  removeWindowID$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.REMOVE_WINDOW),
      withLatestFrom(this.store, (action: windowActions.RemoveWindowAction, state) => {
        return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
      }),
      switchMap(data => {
        const windowIds = Object.keys(data.windows);
        const metaWindowIds = data.windowIds;
        const newWindowIds = metaWindowIds.filter(id => windowIds.includes(id));
        return observableOf(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
      }),
    );

  @Effect()
  reopenClosedWindow$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.REOPEN_CLOSED_WINDOW),
      withLatestFrom(this.store, (action: windowActions.ReopenClosedWindowAction, state) => {
        return { closedWindows: state.local.closedWindows, windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
      }),
      switchMap(data => {
        const lastClosedWindow = data.closedWindows[data.closedWindows.length - 1];
        if (!lastClosedWindow || !lastClosedWindow.windowId) {
          return observableEmpty();
        }

        const lastClosedWindowId = lastClosedWindow.windowId;
        const windows = data.windows;
        if (windows[lastClosedWindowId]) {
          return observableEmpty();
        }

        windows[lastClosedWindowId] = lastClosedWindow;
        this.store.dispatch(new windowActions.SetWindowsAction(Object.values(windows)));
        this.windowService.setupWindow(lastClosedWindowId);
        const newWindowIds = [ ...data.windowIds, lastClosedWindowId ];
        return observableOf(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
      }),
      tap(() => {
        this.store.dispatch(new localActions.PopFromClosedWindowsAction());
      }),
    );

  // Exports the window data
  @Effect()
  exportWindow$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.EXPORT_WINDOW),
      withLatestFrom(this.store, (action: windowActions.ExportWindowAction, state) => {
        return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(data => {
        this.windowService.getWindowExportData(data.windowId).subscribe(exportData => {
          downloadJson(exportData, data.data.layout.title, { fileType: 'agq' });
        });
        return observableEmpty();
      }),
    );

  @Effect()
  importWindow$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.IMPORT_WINDOW),
      switchMap(action => {
        openFile({ accept: '.agq' }).then((data: string) => {
          this.windowService.importWindowDataFromJson(data);
        });
        return observableEmpty();
      })
    );

  @Effect()
  importWindowFromCurl$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowActions.IMPORT_WINDOW_FROM_CURL),
      switchMap((action: windowActions.ImportWindowFromCurlAction) => {
        this.windowService.importWindowDataFromCurl(action.payload.data);
        return observableEmpty();
      })
    );

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private windowService: WindowService
  ) {}
}
