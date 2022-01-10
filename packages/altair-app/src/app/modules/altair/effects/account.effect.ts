import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { environment } from 'environments/environment';
import { EMPTY, from, of, zip } from 'rxjs';
import { catchError, first, map, repeat, switchMap, withLatestFrom, } from 'rxjs/operators';
import { ApiService, NotifyService, StorageService } from '../services';

import * as accountActions from '../store/account/account.action';
import { APP_INIT_ACTION } from '../store/action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';

@Injectable()
export class AccountEffects {

  checkAccountLoginStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(APP_INIT_ACTION),
      switchMap(() => {
        if (!environment.serverReady) {
          return EMPTY;
        }
        return from(this.apiService.getToken()).pipe(
          first(),
        );
      }),
      switchMap((accessToken) => {
        return this.apiService.apiClient.getOrCreateUser().pipe(
          map(result => {
            const data = result.data?.getOrCreateUser;
            if (result.errors?.length || !data) {
              return EMPTY;
            }

            this.store.dispatch(new accountActions.AccountIsLoggedInAction({
              accessToken,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName || '',
            }));
          }),
        );
      }),
    );
  }, { dispatch: false });

  handleSubmitLogin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(accountActions.LOGIN_ACCOUNT),
      withLatestFrom(this.store, (action: accountActions.LoginAccountAction, state) => {
        return { state, action };
      }),
      switchMap(({ action }) => {
        return this.apiService.accountLoginWithAuth0().pipe(
          first(),
        );
      }),
      switchMap(token => {
        if (!token) {
          this.notifyService.error('Sorry, we could not log you in. Please check that your username and password are correct');
          return EMPTY;
        }

        return zip(of(token), this.apiService.apiClient.getOrCreateUser());
      }),
      switchMap(([ accessToken, profileResult ]) => {
        const data = profileResult.data?.getOrCreateUser;
        if (profileResult.errors?.length || !data) {
          this.notifyService.error('Sorry, we could not log you in. Please check that your username and password are correct');
          return EMPTY;
        }

        this.notifyService.success(`You're logged in. Welcome back, ${data.firstName}`);
        this.store.dispatch(new accountActions.AccountIsLoggedInAction({
          accessToken,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName || '',
        }));
        this.store.dispatch(new windowsMetaActions.ShowAccountDialogAction({ value: false }));

        return EMPTY;
      }),
      catchError(error => {
        console.error(error);
        this.notifyService.error('Sorry, we could not log you in. Please check that your username and password are correct');
        return EMPTY;
      }),
      repeat(),
    );
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private apiService: ApiService,
    private notifyService: NotifyService,
  ) {}
}
