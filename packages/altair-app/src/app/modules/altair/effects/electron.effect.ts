import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { of } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { ElectronAppService } from '../services';

import * as variablesActions from '../store/variables/variables.action';
import * as settingsActions from '../store/settings/settings.action';

@Injectable()
export class ElectronEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<RootState>>(Store);
  private electronAppService = inject(ElectronAppService);

  updateSettingsOnFile$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(settingsActions.UPDATE_SETTINGS, settingsActions.SET_SETTINGS_JSON),
        withLatestFrom(
          this.store,
          (action: variablesActions.UpdateFileVariableDataAction, state) => {
            return {
              state,
            };
          }
        ),
        tap(({ state }) => {
          return of(this.electronAppService.updateSettingsOnFile(state.settings));
        })
      );
    },
    { dispatch: false }
  );
}
