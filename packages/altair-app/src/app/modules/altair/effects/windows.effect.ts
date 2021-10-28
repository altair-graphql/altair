
import { Observable, zip, of, EMPTY } from 'rxjs';

import {switchMap, withLatestFrom, tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';

import * as windowActions from '../store/windows/windows.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as localActions from '../store/local/local.action';

import { WindowService } from '../services/window.service';

import { downloadJson, openFile } from '../utils';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

@Injectable()
export class WindowsEffects {

  // Updates windowsMeta with window IDs when a window is added
  addWindowID$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.ADD_WINDOW),
        withLatestFrom(this.store, (action: windowActions.AddWindowAction, state) => {
          return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
        }),
        switchMap(data => {
          const windowIds = Object.keys(data.windows);
          const metaWindowIds = data.windowIds;
          const newWindowIds = [...metaWindowIds, ...windowIds.filter(id => !metaWindowIds.includes(id))]

          return of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
        }),
      )
  });

  // Updates windowsMeta with window IDs when a window is removed
  removeWindowID$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.REMOVE_WINDOW),
        withLatestFrom(this.store, (action: windowActions.RemoveWindowAction, state) => {
          return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
        }),
        switchMap(data => {
          const windowIds = Object.keys(data.windows);
          const metaWindowIds = data.windowIds;
          const newWindowIds = metaWindowIds.filter(id => windowIds.includes(id));
          return of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
        }),
      )
  });

  reopenClosedWindow$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.REOPEN_CLOSED_WINDOW),
        withLatestFrom(this.store, (action: windowActions.ReopenClosedWindowAction, state) => {
          return { closedWindows: state.local.closedWindows, windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
        }),
        switchMap(data => {
          const lastClosedWindow = data.closedWindows[data.closedWindows.length - 1];
          if (!lastClosedWindow || !lastClosedWindow.windowId) {
            return EMPTY;
          }

          const lastClosedWindowId = lastClosedWindow.windowId;
          const windows = data.windows;
          if (windows[lastClosedWindowId]) {
            return EMPTY;
          }

          windows[lastClosedWindowId] = lastClosedWindow;
          this.store.dispatch(new windowActions.SetWindowsAction(Object.values(windows)));
          this.windowService.setupWindow(lastClosedWindowId);
          const newWindowIds = [ ...data.windowIds, lastClosedWindowId ];
          this.store.dispatch(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
          return of(new windowsMetaActions.SetActiveWindowIdAction({ windowId: lastClosedWindowId }));
        }),
        tap(() => {
          this.store.dispatch(new localActions.PopFromClosedWindowsAction());
        }),
      )
  });

  // Exports the window data
  exportWindow$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.EXPORT_WINDOW),
        withLatestFrom(this.store, (action: windowActions.ExportWindowAction, state) => {
          return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
        }),
        switchMap(data => {
          return zip(of(data), this.windowService.getWindowExportData(data.windowId));
        }),
        switchMap(([data, exportData]) => {
          downloadJson(exportData, data.data.layout.title, { fileType: 'agq' });
          return EMPTY;
        }),
      )
  }, { dispatch: false });

  importWindow$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.IMPORT_WINDOW),
        switchMap(action => {
          openFile({ accept: '.agq' }).then((data: string) => {
            this.windowService.importWindowDataFromJson(data);
          });
          return EMPTY;
        })
      )
  }, { dispatch: false });

  importWindowFromCurl$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.IMPORT_WINDOW_FROM_CURL),
        switchMap((action: windowActions.ImportWindowFromCurlAction) => {
          if (action.payload) {
            this.windowService.importWindowDataFromCurl(action.payload.data);
          }
          return EMPTY;
        })
      )
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private windowService: WindowService
  ) {}
}
