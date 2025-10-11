import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { environment } from 'environments/environment';
import { EMPTY, forkJoin, from, of, zip } from 'rxjs';
import {
  catchError,
  map,
  repeat,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { UnknownError } from '../interfaces/shared';
import { AccountService, NotifyService, SharingService } from '../services';

import { APP_INIT_ACTION } from '../store/action';
import * as accountActions from '../store/account/account.action';
import * as collectionActions from '../store/collection/collection.action';
import * as workspaceActions from '../store/workspace/workspace.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import { debug } from '../utils/logger';
import { externalLink, fromPromise } from '../utils';
import { getErrorResponse } from '../utils/errors';
import { consumeQueryParam } from '../utils/url';

@Injectable()
export class AccountEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<RootState>>(Store);
  private accountService = inject(AccountService);
  private notifyService = inject(NotifyService);
  private sharingService = inject(SharingService);

  checkAccountLoginStatus$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(APP_INIT_ACTION),
        switchMap(() => {
          if (!environment.serverReady) {
            return EMPTY;
          }
          return this.accountService.observeUser().pipe(take(1));
        }),
        switchMap((user) => {
          const showLogin = consumeQueryParam('show_login');
          if (!user) {
            // account is not logged in
            // check query parameter and show the account dialog if necessary
            if (showLogin === 'true') {
              this.store.dispatch(
                new windowsMetaActions.ShowAccountDialogAction({ value: true })
              );
            }
            return EMPTY;
          }

          this.store.dispatch(
            new accountActions.AccountIsLoggedInAction({
              email: user?.email ?? '',
              firstName: user?.firstName ?? user?.email ?? '',
              lastName: '',
              picture: user.picture ?? '',
              isNewUser: user.isNewUser,
            })
          );

          return EMPTY;
        }),
        switchMap(() => {
          // account has been checked on app initialization
          this.store.dispatch(new accountActions.AccountCheckedInitAction());
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
          return this.accountService
            .accountLogin$(action.payload?.provider)
            .pipe(take(1));
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
              email: user.email ?? '',
              firstName: user.firstName ?? user.email ?? '',
              lastName: '',
              picture: user.picture ?? '',
              isNewUser: user.isNewUser,
            })
          );
          this.store.dispatch(
            new windowsMetaActions.ShowAccountDialogAction({ value: false })
          );

          return EMPTY;
        }),
        catchError((error) => {
          return fromPromise(getErrorResponse(error)).pipe(
            switchMap((error) => {
              debug.error(error);
              this.notifyService.errorWithError(
                error,
                'Sorry, we could not log you in. Please check that your username and password are correct'
              );
              return EMPTY;
            })
          );
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
          this.store.dispatch(new collectionActions.LoadCollectionsAction());

          return EMPTY;
        }),
        catchError((error) => {
          return fromPromise(getErrorResponse(error)).pipe(
            switchMap((error) => {
              debug.error(error);
              this.notifyService.errorWithError(
                error,
                'Sorry, we could not log you out. Please try again.'
              );
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  onLoggedIn$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(accountActions.ACCOUNT_IS_LOGGED_IN),
        switchMap(() => {
          this.store.dispatch(new accountActions.LoadTeamsAction());
          this.store.dispatch(new workspaceActions.LoadWorkspacesAction());
          return EMPTY;
        }),
        catchError((err: UnknownError) => {
          return fromPromise(getErrorResponse(err)).pipe(
            switchMap((error) => {
              debug.error(error);
              this.notifyService.errorWithError(err, 'Could not load teams');
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  loadTeams$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(accountActions.LOAD_TEAMS),
      switchMap((action) => this.accountService.getTeams()),
      map(
        (teams) =>
          new accountActions.SetTeamsAction({
            teams: teams.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description ? t.description : undefined,
            })),
          })
      ),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((error) => {
            debug.error(error);
            this.notifyService.errorWithError(err, 'Could not load teams');
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  loadUserDataOnLoggedIn$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(accountActions.ACCOUNT_IS_LOGGED_IN),
        switchMap((action: accountActions.AccountIsLoggedInAction) =>
          forkJoin([
            fromPromise(this.accountService.getStats()),
            fromPromise(this.accountService.getPlan()),
            fromPromise(this.accountService.getPlanInfos()),
            fromPromise(this.accountService.getAvailableCredits()),
            of(action.payload),
          ])
        ),
        map(([stats, plan, planInfos, availableCredits, user]) => {
          // check query parameter and show the update plan dialog if necessary
          if (plan.canUpgradePro) {
            const selectedPlan = consumeQueryParam('plan_select');
            if (selectedPlan === 'pro') {
              this.store.dispatch(
                new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
              );
              this.accountService.getUpgradeProUrl().then(({ url }) => {
                externalLink(url);
              });
            } else if (user.isNewUser) {
              this.store.dispatch(
                new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
              );
            }
          }

          this.store.dispatch(
            new accountActions.UpdateAccountAction({
              stats: {
                queriesCount: stats.queries.own,
                queryCollectionsCount: stats.collections.own,
                teamsCount: stats.teams.own,
              },
              plan,
              planInfos,
              availableCredits,
            })
          );
        }),
        catchError((err: UnknownError) => {
          return fromPromise(getErrorResponse(err)).pipe(
            switchMap((error) => {
              debug.error(error);
              this.notifyService.errorWithError(err, 'Could not load user data');
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    },
    { dispatch: false }
  );
}
