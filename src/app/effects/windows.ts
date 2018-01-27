import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';

import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';

@Injectable()
export class WindowsEffects {

  @Effect() // add
  addWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.ADD_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    }).switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = [...metaWindowIds, ...windowIds.filter(id => !metaWindowIds.includes(id))]

      return Observable.of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    });

  @Effect() // remove
  removeWindowID$: Observable<Action> = this.actions$
    .ofType(windowActions.REMOVE_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
    }).switchMap(data => {
      const windowIds = Object.keys(data.windows);
      const metaWindowIds = data.windowIds;
      const newWindowIds = metaWindowIds.filter(id => windowIds.includes(id));
      return Observable.of(new windowsMetaActions.SetWindowIdsAction({ ids: newWindowIds }));
    });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>
  ) {}
}
