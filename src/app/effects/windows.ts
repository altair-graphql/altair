import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

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
      openFile({ accept: '.agq' }).then((data: string) => {
        this.windowService.importWindowData(data);
      });
      return Observable.empty();
    });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private windowService: WindowService
  ) {}
}
