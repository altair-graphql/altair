import { EMPTY, Observable, of, zip, forkJoin, from, pipe } from 'rxjs';

import {
  map,
  withLatestFrom,
  switchMap,
  tap,
  catchError,
  filter,
  repeat,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';

import * as fromRoot from '../store';

import * as collectionActions from '../store/collection/collection.action';
import * as accountActions from '../store/account/account.action';
import * as dialogsActions from '../store/dialogs/dialogs.action';
import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';
import {
  QueryCollectionService,
  WindowService,
  NotifyService,
} from '../services';
import { downloadJson, openFile, openFiles } from '../utils';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { UnknownError } from '../interfaces/shared';
import { debug } from '../utils/logger';

@Injectable()
export class QueryCollectionEffects {
  // Updates windowsMeta with window IDs when a window is added

  createCollectionAndSaveQueryToCollection$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          collectionActions.CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION
        ),
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
          zip(of(res), this.windowService.getWindowExportData(res.windowId))
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

          return this.collectionService.create(
            {
              title: res.action.payload.collectionTitle,
              queries: [query],
              preRequest: {
                script: '',
                enabled: false,
              },
              postRequest: {
                script: '',
                enabled: false,
              },
            },
            res.action.payload.parentCollectionId
          );
        }),
        tap(() => this.notifyService.success('Created collection.')),
        map(() => new collectionActions.LoadCollectionsAction()),
        catchError((err: UnknownError) => {
          this.notifyService.error(err.message || err);
          return EMPTY;
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
        forkJoin([
          of(res),
          this.windowService.getWindowExportData(res.windowId),
        ])
      ),
      switchMap(([res, exportData]) => {
        const query = exportData;
        if (!query) {
          return EMPTY;
        }

        if (res.action.payload.windowTitle) {
          query.windowName = res.action.payload.windowTitle;
        }
        return this.collectionService.addQuery(
          res.action.payload.collectionId,
          query
        );
      }),
      tap(() => this.notifyService.success('Added query to collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        this.notifyService.error(err.message || err);
        return EMPTY;
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
        forkJoin([
          of(res),
          this.windowService.getWindowExportData(res.windowId),
        ])
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
          return this.collectionService.updateQuery(
            res.data.layout.collectionId,
            res.data.layout.windowIdInCollection,
            query
          );
        }

        return EMPTY;
      }),
      tap(() => this.notifyService.success('Updated query in collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        this.notifyService.error(err.message || err);
        return EMPTY;
      }),
      repeat()
    );
  });

  loadCollections$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.LOAD_COLLECTIONS),
      switchMap((action) => this.collectionService.getAll()),
      map(
        (collections) =>
          new collectionActions.SetCollectionsAction({ collections })
      ),
      catchError((err: UnknownError) => {
        this.notifyService.error(err.message || err);
        return EMPTY;
      }),
      repeat()
    );
  });

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
        this.notifyService.error(err.message || err);
        return EMPTY;
      }),
      repeat()
    );
  });

  updateCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.UPDATE_COLLECTION),
      switchMap((action: collectionActions.UpdateCollectionAction) => {
        return this.collectionService.updateCollection(
          action.payload.collectionId,
          action.payload.collection
        );
      }),
      tap(() => this.notifyService.success('Updated collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        this.notifyService.error(err.message || err);
        return EMPTY;
      }),
      repeat()
    );
  });

  deleteCollection$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.DELETE_COLLECTION),
      switchMap((action: collectionActions.DeleteCollectionAction) => {
        return this.collectionService.deleteCollection(
          action.payload.collectionId
        );
      }),
      tap(() => this.notifyService.success('Deleted query from collection.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        this.notifyService.error(err.message || err);
        return EMPTY;
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
          this.notifyService.error(err.message || err);
          return EMPTY;
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
      tap((data) => {
        data.forEach((elem) =>
          this.collectionService.importCollectionDataFromJson(elem)
        );
      }),
      tap(() =>
        this.notifyService.success('Successfully imported collection.')
      ),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((error) => {
        const errorMessage = error.message ? error.message : error.toString();
        this.notifyService.error(
          `Something went wrong importing collection. Error: ${errorMessage}`
        );
        return EMPTY;
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
      switchMap(() => {
        return from(this.collectionService.syncRemoteToLocal());
      }),
      tap(() =>
        this.notifyService.success(
          'Successfully downloaded remote collections.'
        )
      ),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((error) => {
        const errorMessage = error.message ? error.message : error.toString();
        this.notifyService.error(
          `Something went wrong syncing remote collections. Error: ${errorMessage}`
        );
        return EMPTY;
      }),
      repeat()
    );
  });

  syncLocalCollectionToRemote$: Observable<Action> = createEffect(() => {
    return this.actions$.pipe(
      ofType(collectionActions.SYNC_LOCAL_COLLECTION_TO_REMOTE),
      switchMap(
        (action: collectionActions.SyncLocalCollectionToRemoteAction) => {
          const collection = action.payload.collection;

          if (collection.id) {
            if (collection.serverId) {
              return this.collectionService.updateRemoteCollection(
                collection.id
              );
            }
            return this.collectionService.createRemoteCollection(
              collection.id,
              collection
            );
          }
          return EMPTY;
        }
      ),
      tap(() => this.notifyService.success('Synced collection to remote.')),
      map(() => new collectionActions.LoadCollectionsAction()),
      catchError((err: UnknownError) => {
        debug.error(err);
        this.notifyService.error(err.message || err);
        return EMPTY;
      }),
      repeat()
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private collectionService: QueryCollectionService,
    private windowService: WindowService,
    private notifyService: NotifyService
  ) {}
}
