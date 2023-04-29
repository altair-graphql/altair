import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { EMPTY, from } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { AccountService, StorageService } from '../services';

import * as workspaceActions from '../store/workspace/workspace.action';

@Injectable()
export class WorkspaceEffects {
  loadWorkspaces$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(workspaceActions.LOAD_WORKSPACES),
        switchMap(() => this.accountService.getWorkspaces()),
        switchMap((workspaces) => {
          this.store.dispatch(
            new workspaceActions.SetWorkspacesAction(
              workspaces.map((w) => ({
                id: w.id,
                name: w.name,
                teamId: w.teamId ?? undefined,
              }))
            )
          );

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private storageService: StorageService,
    private accountService: AccountService
  ) {}
}
