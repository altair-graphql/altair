import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { environment } from 'environments/environment';
import { EMPTY, from, of, zip } from 'rxjs';
import {
  catchError,
  first,
  map,
  repeat,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { ApiService, NotifyService, StorageService } from '../services';

import * as accountActions from '../store/account/account.action';
import { APP_INIT_ACTION } from '../store/action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';

@Injectable()
export class AccountEffects {
  checkAccountLoginStatus$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(APP_INIT_ACTION),
        switchMap(() => {
          if (!environment.serverReady) {
            return EMPTY;
          }
          return of(this.apiService.getSession()).pipe(first());
        }),
        switchMap((session) => {
          if (!session) {
            return EMPTY;
          }

          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: session.user?.email || '',
              firstName:
                session.user?.user_metadata.full_name ||
                session.user?.email ||
                '',
              lastName: '',
            })
          );

          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  handleSubmitLogin$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(accountActions.LOGIN_ACCOUNT),
        withLatestFrom(
          this.store,
          (action: accountActions.LoginAccountAction, state) => {
            return { state, action };
          }
        ),
        switchMap(({ action }) => {
          return this.apiService.accountLoginWithSupabase().pipe(first());
        }),
        switchMap((data) => {
          if (!data.session?.user) {
            this.notifyService.error(
              'Sorry, we could not log you in. Please check that your credentials are correct.'
            );
            return EMPTY;
          }

          this.notifyService.success(
            `You're logged in. Welcome back, ${data.session.user.email}`
          );
          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: data.session.user.email || '',
              firstName:
                data.session.user.user_metadata.full_name ||
                data.session.user.email ||
                '',
              lastName: '',
            })
          );
          this.store.dispatch(
            new windowsMetaActions.ShowAccountDialogAction({ value: false })
          );

          return EMPTY;
        }),
        catchError((error) => {
          console.error(error);
          this.notifyService.error(
            'Sorry, we could not log you in. Please check that your username and password are correct'
          );
          return EMPTY;
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private apiService: ApiService,
    private notifyService: NotifyService
  ) {}
}
