import { EMPTY, Observable, of, zip, forkJoin, from } from 'rxjs';

import {
  map,
  withLatestFrom,
  switchMap,
  tap,
  catchError,
  repeat,
} from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';

import * as collectionActions from '../store/collection/collection.action';
import * as accountActions from '../store/account/account.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import * as windowsActions from '../store/windows/windows.action';
import * as layoutActions from '../store/layout/layout.action';
import {
  QueryCollectionService,
  WindowService,
  NotifyService,
  ApiService,
} from '../services';
import { downloadJson, fromPromise, openFiles } from '../utils';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { IQuery } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { UnknownError } from '../interfaces/shared';
import { debug } from '../utils/logger';
import { getApiErrorCode, getErrorResponse } from '../utils/errors';

@Injectable()
export class QueryCollectionEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<RootState>>(Store);
  private collectionService = inject(QueryCollectionService);
  private apiService = inject(ApiService);
  private windowService = inject(WindowService);
  private notifyService = inject(NotifyService);

  // Updates windowsMeta with window IDs when a window is added

  createCollectionAndSaveQueryToCollection$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(collectionActions.CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION),
        withLatestFrom(
          this.store,
          (
            action: collectionActions.CreateCollectionAndSaveQueryToCollectionAction,
            state
          ) => {
            return {
              data: state.windows[action.payload.windowId],
              windowId: action.payload.windowId,
              action,
            };
          }
        ),
        switchMap((res) =>
          zip(of(res), this.windowService.getWindowExportData$(res.windowId))
        ),
        switchMap(([res, exportData]) => {
          // Create collection
          // Then save query to collection
          const query = exportData;
          if (!query) {
            return EMPTY;
          }
          if (res.action.payload.windowTitle) {
            query.windowName = res.action.payload.windowTitle;
          }

          return from(
            this.collectionService.createCollection(
              {
                title: res.action.payload.collectionTitle,
                queries: [],
                preRequest: {
                  script: '',
                  enabled: false,
                },
                postRequest: {
                  script: '',
                  enabled: false,
                },
              },
              res.action.payload.workspaceId,
              res.action.payload.teamId,
              undefined,
              res.action.payload.parentCollectionId
            )
          ).pipe(
            switchMap((collectionId) => {
              if (typeof collectionId === 'undefined') {
                throw new Error('Created collection ID cannot be undefined!');
              }
              return this.saveExistingWindowToCollection(
                res.windowId,
                collectionId.toString(),
                query,
                res.action.payload.windowTitle
              );
            })
          );
        }),
        tap(() => this.notifyService.success('Created collection.')),
        map(() => new collectionActions.LoadCollectionsAction()),
        catchError((err: UnknownError) => {
          return fromPromise(getErrorResponse(err)).pipe(
            switchMap((err) => {
              debug.error(err);
              this.notifyService.errorWithError(err, 'Could not create collection');
              if (getApiErrorCode(err) === 'ERR_MAX_QUERY_COUNT') {
                this.store.dispatch(
                  new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
                );
              }
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    }
  );

  saveQueryToCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.SAVE_QUERY_TO_COLLECTION),
      withLatestFrom(
        this.store,
        (action: collectionActions.SaveQueryToCollectionAction, state) => {
          return {
            data: state.windows[action.payload.windowId],
            windowId: action.payload.windowId,
            action,
          };
        }
      ),
      switchMap((res) =>
        forkJoin([of(res), this.windowService.getWindowExportData$(res.windowId)])
      ),
      switchMap(([res, exportData]) => {
        const query = exportData;
        if (!query) {
          return EMPTY;
        }

        if (res.action.payload.windowTitle) {
          query.windowName = res.action.payload.windowTitle;
        }
        return this.saveExistingWindowToCollection(
          res.windowId,
          res.action.payload.collectionId.toString(),
          query,
          res.action.payload.windowTitle
        );
      }),
      tap(() => this.notifyService.success('Added query to collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Could not add query to collection'
            );

            if (getApiErrorCode(err) === 'ERR_MAX_QUERY_COUNT') {
              this.store.dispatch(
                new windowsMetaActions.ShowUpgradeDialogAction({ value: true })
              );
            }
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  updateQueryInCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.UPDATE_QUERY_IN_COLLECTION),
      withLatestFrom(
        this.store,
        (action: collectionActions.UpdateQueryInCollectionAction, state) => {
          return {
            data: state.windows[action.payload.windowId],
            windowId: action.payload.windowId,
            action,
          };
        }
      ),
      switchMap((res) =>
        forkJoin([of(res), this.windowService.getWindowExportData$(res.windowId)])
      ),
      switchMap(([res, exportData]) => {
        const query = exportData;

        if (
          !res.data?.layout.collectionId ||
          !res.data.layout.windowIdInCollection
        ) {
          this.store.dispatch(
            new windowsMetaActions.ShowAddToCollectionDialogAction({
              value: true,
              windowId: res.windowId,
            })
          );
          return EMPTY;
        }

        if (query) {
          return from(
            this.collectionService.updateQuery(
              res.data.layout.collectionId,
              res.data.layout.windowIdInCollection,
              query
            )
          );
        }

        return EMPTY;
      }),
      tap(() => this.notifyService.success('Updated query in collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Could not update query in collection'
            );
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  loadCollections$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(collectionActions.LOAD_COLLECTIONS),
        switchMap(() => this.collectionService.getAll()),
        map((collections) => {
          this.store.dispatch(
            new collectionActions.SetCollectionsAction({ collections })
          );
          return EMPTY;
        }),
        tap(() => {
          this.store.dispatch(new windowsActions.ReloadCollectionWindowsAction());
        }),
        catchError((err: UnknownError) => {
          return fromPromise(getErrorResponse(err)).pipe(
            switchMap((err) => {
              debug.error(err);
              this.notifyService.errorWithError(err, 'Could not load collection');
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  deleteQueryFromCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.DELETE_QUERY_FROM_COLLECTION),
      switchMap((action: collectionActions.DeleteQueryFromCollectionAction) => {
        return this.collectionService.deleteQuery(
          action.payload.collectionId,
          action.payload.query
        );
      }),
      tap(() => this.notifyService.success('Deleted query from collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Could not delete query from collection'
            );
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  updateCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.UPDATE_COLLECTION),
      withLatestFrom(
        this.store,
        (action: collectionActions.UpdateCollectionAction, state) => {
          return {
            state,
            action,
          };
        }
      ),
      switchMap(({ action, state }) => {
        const openCollectionWindows = Object.values(state.windows).filter(
          (w) => w.layout.collectionId === action.payload.collectionId
        );
        if (openCollectionWindows.length) {
          return from(
            this.notifyService.confirm(
              'Do you want to save all changes to open queries in the collection?'
            )
          ).pipe(
            map((res) => {
              if (res) {
                // User confirmed, save all open queries in the collection before proceeding
                openCollectionWindows.forEach((w) => {
                  this.store.dispatch(
                    new collectionActions.UpdateQueryInCollectionAction({
                      windowId: w.windowId,
                    })
                  );
                });
              }
              return action;
            })
          );
        }
        return of(action);
      }),
      switchMap((action) => {
        return this.collectionService.updateCollection(
          action.payload.collectionId,
          action.payload.collection
        );
      }),
      tap(() => this.notifyService.success('Updated collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(err, 'Could not update collection');
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  deleteCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.DELETE_COLLECTION),
      switchMap((action: collectionActions.DeleteCollectionAction) => {
        return this.collectionService.deleteCollection(action.payload.collectionId);
      }),
      tap(() => this.notifyService.success('Deleted collection successfully.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(err, 'Could not delete collection');
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  exportCollection$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(collectionActions.EXPORT_COLLECTION),
        switchMap((action: collectionActions.ExportCollectionAction) => {
          return this.collectionService.getExportCollectionData(
            action.payload.collectionId
          );
        }),
        switchMap((exportData) => {
          if (exportData) {
            downloadJson(exportData, exportData.title, { fileType: 'agc' });
          }
          return EMPTY;
        }),
        catchError((err: UnknownError) => {
          return fromPromise(getErrorResponse(err)).pipe(
            switchMap((err) => {
              debug.error(err);
              this.notifyService.errorWithError(err, 'Could not export collection');
              return EMPTY;
            })
          );
        }),
        repeat()
      );
    },
    { dispatch: false }
  );

  importCollections$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.IMPORT_COLLECTIONS),
      switchMap(() => {
        return from(openFiles({ accept: '.agc' }));
      }),
      switchMap((data) => {
        const res = data.map((elem) =>
          this.collectionService.importCollectionDataFromJson(elem)
        );

        return from(Promise.all(res).then(() => true));
      }),
      map((res) => {
        if (res) {
          this.notifyService.success('Successfully imported collection.');
        }
      }),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((error) => {
        return fromPromise(getErrorResponse(error)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Something went wrong importing collection'
            );
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  syncRemoteToLocalOnLoggedIn$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        accountActions.ACCOUNT_IS_LOGGED_IN,
        collectionActions.SYNC_REMOTE_COLLECTIONS_TO_LOCAL
      ),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((error) => {
        return fromPromise(getErrorResponse(error)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Something went wrong syncing remote collections.'
            );
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  listenForCollectionChanges$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(accountActions.ACCOUNT_IS_LOGGED_IN),
      switchMap(() => {
        return this.apiService.listenForCollectionChanges();
      }),
      map(() => {
        return new collectionActions.LoadCollectionsAction();
      }),
      catchError((error) => {
        return fromPromise(getErrorResponse(error)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(
              err,
              'Something went wrong listening for collection changes.'
            );
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  syncLocalCollectionToRemote$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.SYNC_LOCAL_COLLECTION_TO_REMOTE),
      switchMap((action: collectionActions.SyncLocalCollectionToRemoteAction) => {
        const collection = action.payload.collection;

        if (collection.id) {
          return from(
            this.collectionService.transformCollectionToRemoteCollection(
              collection.id
            )
          );
        }
        return EMPTY;
      }),
      tap(() => this.notifyService.success('Synced collection to remote.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        return fromPromise(getErrorResponse(err)).pipe(
          switchMap((err) => {
            debug.error(err);
            this.notifyService.errorWithError(err, 'Could not sync collection');
            return EMPTY;
          })
        );
      }),
      repeat()
    );
  });

  saveExistingWindowToCollection(
    windowId: string,
    collectionId: string,
    query: IQuery,
    title?: string
  ) {
    return from(this.collectionService.addQuery(collectionId, query)).pipe(
      switchMap((queryId) => {
        this.store.dispatch(
          new layoutActions.SetWindowIdInCollectionAction(windowId, {
            collectionId: collectionId.toString(),
            windowIdInCollection: queryId,
          })
        );
        if (title) {
          this.store.dispatch(
            new layoutActions.SetWindowNameAction(windowId, {
              title: title,
              setByUser: true,
            })
          );
        }

        return of(true);
      })
    );
  }
}
