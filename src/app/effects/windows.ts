
import {empty as observableEmpty, of as observableOf,  Observable } from 'rxjs';

import {switchMap, withLatestFrom} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';

import * as fromRoot from '../reducers';
import * as fromWindows from '../reducers/windows';

import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';

import { WindowService } from '../services/window.service';

import { downloadJson, openFile } from '../utils';

@Injectable()
export class WindowsEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  addWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.ADD_WINDOW).pipe(
    withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    }),
    switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = [...metaWindowIds, ...windowIds.filter(id => !metaWindowIds.includes(id))]

      return observableOf(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    }),);

  // Updates windowsMeta with window IDs when a window is removed
  @Effect()
  removeWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.REMOVE_WINDOW).pipe(
    withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    }),
    switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = metaWindowIds.filter(id => windowIds.includes(id));
      return observableOf(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    }),);

  // Exports the window data
  @Effect()
  exportWindow$: Observable<Action> = this.actions$
    .ofType(windowActions.EXPORT_WINDOW).pipe(
    withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
    }),
    switchMap(data => {
      this.windowService.getWindowExportData(data.windowId).subscribe(exportData => {
        downloadJson(exportData, data.data.layout.title, { fileType: 'agq' });
      });
      return observableEmpty();
    }),);

  @Effect()
  importWindow$: Observable<Action> = this.actions$
    .ofType(windowActions.IMPORT_WINDOW).pipe(
    switchMap(action => {
      openFile({ accept: '.agq' }).then((data: string) => {
        this.windowService.importWindowDataFromJson(data);
      });
      return observableEmpty();
    }));

  @Effect()
  importWindowFromCurl$: Observable<Action> = this.actions$
    .ofType(windowActions.IMPORT_WINDOW_FROM_CURL).pipe(
    switchMap((action: windowActions.Action) => {
      this.windowService.importWindowDataFromCurl(action.payload.data);
      return observableEmpty();
    }));

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private windowService: WindowService
  ) {}
}
