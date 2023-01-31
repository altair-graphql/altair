import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { environment } from 'environments/environment';
import { EMPTY, from } from 'rxjs';
import {
  catchError,
  map,
  repeat,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { UnknownError } from '../interfaces/shared';
import { AccountService, NotifyService } from '../services';

import * as accountActions from '../store/account/account.action';
import { APP_INIT_ACTION } from '../store/action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import { debug } from '../utils/logger';

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
              firstName: user?.firstName || user?.email || '',
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
        switchMap((user) => {
          if (!user) {
            this.notifyService.error(
              'Sorry, we could not log you in. Please check that your credentials are correct.'
            );
            return EMPTY;
          }

          this.notifyService.success(
            `You're logged in. Welcome back, ${user.firstName || user.email}`
          );
          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: user.email || '',
              firstName: user.firstName || user.email || '',
              lastName: '',
            })
          );
          this.store.dispatch(
            new windowsMetaActions.ShowAccountDialogAction({ value: false })
          );

          return EMPTY;
        }),
        catchError((error) => {
          debug.error(error);
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

  logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(accountActions.LOGOUT_ACCOUNT),
        withLatestFrom(
          this.store,
          (action: accountActions.LogoutAccountAction, state) => {
            return { state, action };
          }
        ),
        switchMap(({ action }) => {
          return from(this.accountService.logout());
        }),
        switchMap(() => {
          this.notifyService.success(`You're logged out`);
          this.store.dispatch(new accountActions.AccountLoggedOutAction());
          this.store.dispatch(
            new windowsMetaActions.ShowAccountDialogAction({ value: false })
          );

          return EMPTY;
        }),
        catchError((error) => {
          debug.error(error);
          this.notifyService.error(
            'Sorry, we could not log you out. Please try again.'
          );
          return EMPTY;
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  loadTeamsOnLoggedIn$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(accountActions.ACCOUNT_IS_LOGGED_IN),
      switchMap((action) => this.accountService.getTeams()),
      map((teams) => new accountActions.SetTeamsAction({ teams })),
      catchError((err: UnknownError) => {
        debug.error(err);
        this.notifyService.error('Could not load teams');
        return EMPTY;
      }),
      repeat()
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private accountService: AccountService,
    private notifyService: NotifyService
  ) {}
}
