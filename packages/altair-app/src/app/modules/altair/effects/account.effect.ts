import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { environment } from 'environments/environment';
import { EMPTY, from } from 'rxjs';
import {
  catchError,
  repeat,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { AccountService, NotifyService } from '../services';

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
          return from(this.accountService.getUser()).pipe(take(1));
        }),
        switchMap((user) => {
          if (!user) {
            return EMPTY;
          }

          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: user?.email || '',
              firstName: user?.displayName || user?.email || '',
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
          return this.accountService.accountLogin$().pipe(take(1));
        }),
        switchMap((data) => {
          if (!data.user) {
            this.notifyService.error(
              'Sorry, we could not log you in. Please check that your credentials are correct.'
            );
            return EMPTY;
          }

          this.notifyService.success(
            `You're logged in. Welcome back, ${
              data.user.displayName || data.user.email
            }`
          );
          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: data.user.email || '',
              firstName: data.user.displayName || data.user.email || '',
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
    private accountService: AccountService,
    private notifyService: NotifyService
  ) {}
}
