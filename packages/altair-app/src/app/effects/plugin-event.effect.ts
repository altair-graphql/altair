import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { Observable, empty as observableEmpty } from 'rxjs';
import { withLatestFrom, switchMap } from 'rxjs/operators';

import * as fromRoot from 'app/store';

import * as queryActions from 'app/store/query/query.action';
import * as schemaActions from 'app/store/gql-schema/gql-schema.action';
import * as windowsMetaActions from 'app/store/windows-meta/windows-meta.action';
import { PluginEventService } from 'app/services';

@Injectable()
export class PluginEventEffects {

  @Effect()
  onSetQuery$: Observable<Action> = this.actions$
    .pipe(
      ofType(queryActions.SET_QUERY),
      withLatestFrom(this.store, (action: queryActions.SetQueryAction, state) => {
        return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
      }),
      switchMap(data => {
        this.pluginEventService.emit('query.change', {
          windowId: data.windowId,
          data: data.data.query.query || '',
        });
        return observableEmpty();
      }),
    );

  @Effect()
  onSetSDL$: Observable<Action> = this.actions$
    .pipe(
      ofType(schemaActions.SET_SCHEMA_SDL),
      withLatestFrom(this.store, (action: schemaActions.SetSchemaSDLAction, state) => {
        return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
      }),
      switchMap(data => {
        this.pluginEventService.emit('sdl.change', {
          windowId: data.windowId,
          data: data.data.schema.sdl,
        });
        return observableEmpty();
      }),
    );

  @Effect()
  onSetActiveWindow$: Observable<Action> = this.actions$
    .pipe(
      ofType(windowsMetaActions.SET_ACTIVE_WINDOW_ID),
      withLatestFrom(this.store, (action: windowsMetaActions.SetActiveWindowIdAction, state) => {
        return { state, data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(data => {
        this.pluginEventService.emit('current-window.change', {
          windowId: data.windowId,
        });
        return observableEmpty();
      }),
    );

  @Effect()
  onSetQueryResult$: Observable<Action> = this.actions$
    .pipe(
      ofType(queryActions.SET_QUERY_RESULT),
      withLatestFrom(this.store, (action: queryActions.SetQueryResultAction, state) => {
        return { state, data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(data => {
        this.pluginEventService.emit('query-result.change', {
          windowId: data.windowId,
          data: data.action.payload,
        });
        return observableEmpty();
      }),
    );

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private pluginEventService: PluginEventService,
  ) {}
}
