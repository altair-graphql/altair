import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { Observable, EMPTY } from 'rxjs';
import { withLatestFrom, switchMap } from 'rxjs/operators';

import * as fromRoot from 'app/store';

import * as queryActions from 'app/store/query/query.action';
import * as schemaActions from 'app/store/gql-schema/gql-schema.action';
import * as windowsMetaActions from 'app/store/windows-meta/windows-meta.action';
import { PluginEventService } from 'app/services';

@Injectable()
export class PluginEventEffects {

  onSetQuery$: Observable<Action> = createEffect(() => {
    return this.actions$
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
          return EMPTY;
        }),
      )
  }, { dispatch: false });


  onSetSDL$: Observable<Action> = createEffect(() => {
    return this.actions$
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
          return EMPTY;
        }),
      )
  }, { dispatch: false });


  onSetActiveWindow$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowsMetaActions.SET_ACTIVE_WINDOW_ID),
        withLatestFrom(this.store, (action: windowsMetaActions.SetActiveWindowIdAction, state) => {
          return { state, data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
        }),
        switchMap(data => {
          this.pluginEventService.emit('current-window.change', {
            windowId: data.windowId,
          });
          return EMPTY;
        }),
      )
  }, { dispatch: false });


  onSetQueryResult$: Observable<Action> = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(queryActions.SET_QUERY_RESULT),
        withLatestFrom(this.store, (action: queryActions.SetQueryResultAction, state) => {
          return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
        }),
        switchMap(data => {
          this.pluginEventService.emit('query-result.change', {
            windowId: data.windowId,
            data: data.action.payload,
          });
          return EMPTY;
        }),
      )
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private pluginEventService: PluginEventService,
  ) {}
}
