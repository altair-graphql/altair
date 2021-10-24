import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { EMPTY, from } from 'rxjs';
import { switchMap, withLatestFrom, } from 'rxjs/operators';
import { StorageService } from '../services';

import * as variablesActions from '../store/variables/variables.action';
import * as windowActions from '../store/windows/windows.action';

@Injectable()
export class LocalEffects {

  storeFilesOnUpdateFileVariableData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(variablesActions.UPDATE_FILE_VARIABLE_DATA),
      withLatestFrom(this.store, (action: variablesActions.UpdateFileVariableDataAction, state) => {
        return { state, data: state.windows[action.windowId], windowId: action.windowId, action };
      }),
      switchMap(({ data, action, windowId }) => {
        const idx = action.payload.index;
        const fileVariable = data.variables.files[idx];
        if (!action.payload.fromCache) {
          if (fileVariable.id && Array.isArray(fileVariable.data)) {
            const putPromise = this.storageService.selectedFiles.put({
              id: fileVariable.id,
              data: fileVariable.data,
              windowId,
            });

            return from(putPromise);
          }
        }

        return EMPTY;
      }),
    );
  }, { dispatch: false });

  removeFilesOnRemoveWindow$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(windowActions.REMOVE_WINDOW),
        withLatestFrom(this.store, (action: windowActions.RemoveWindowAction, state) => {
          return { windows: state.windows, windowIds: state.windowsMeta.windowIds, action };
        }),
        switchMap(({ action }) => {
          const deletePromise = this.storageService.selectedFiles
            .where({ windowId: action.payload.windowId })
            .delete();

          return from(deletePromise);
        }),
      )
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private storageService: StorageService,
  ) {}
}
