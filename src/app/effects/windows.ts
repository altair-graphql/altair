import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';

import * as windowActions from '../actions/windows/windows';
import * as windowsMetaActions from '../actions/windows-meta/windows-meta';

@Injectable()
export class WindowsEffects {

  @Effect() // remove, add, reposition
  setWindowIDs$: Observable<Action> = this.actions$
    .ofType(windowActions.ADD_WINDOW, windowActions.REMOVE_WINDOW)
    .withLatestFrom(this.store, (action: windowActions.Action, state) => {
      return { windows: state.windows, action };
    }).switchMap(data => {
      const windowIds = Object.keys(data.windows);
      return Observable.of(new windowsMetaActions.SetWindowIdsAction({ ids: windowIds }));
    });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>
  ) {}
}
