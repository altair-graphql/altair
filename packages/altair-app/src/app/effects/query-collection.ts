
import { empty as observableEmpty,  Observable } from 'rxjs';

import { map, withLatestFrom, switchMap, tap, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions, ofType } from '@ngrx/effects';

import * as fromRoot from '../reducers';

import * as collectionActions from '../actions/collection/collection';
import { QueryCollectionService, WindowService, NotifyService } from '../services';
import { downloadJson, openFile } from 'app/utils';


@Injectable()
export class QueryCollectionEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  createCollectionAndSaveQueryToCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION),
      withLatestFrom(this.store, (action: collectionActions.CreateCollectionAndSaveQueryToCollectionAction, state) => {
          return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(res => {
        // Create collection
        // Then save query to collection
        this.windowService.getWindowExportData(res.windowId).subscribe(exportData => {
          const query = exportData;
          if (res.action.payload.windowTitle) {
            query.windowName = res.action.payload.windowTitle;
          }

          this.collectionService.create({
            title: res.action.payload.collectionTitle,
            queries: [ query ]
          }).subscribe(() => {
            this.notifyService.success('Created collection.');
            this.store.dispatch(new collectionActions.LoadCollectionsAction());
          });
        });
        return observableEmpty();
      }),
    );

  @Effect()
  saveQueryToCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.SAVE_QUERY_TO_COLLECTION),
      withLatestFrom(this.store, (action: collectionActions.SaveQueryToCollectionAction, state) => {
        return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(res => {
        this.windowService.getWindowExportData(res.windowId).subscribe(exportData => {
          const query = exportData;
          if (res.action.payload.windowTitle) {
            query.windowName = res.action.payload.windowTitle;
          }
          this.collectionService.addQuery(res.action.payload.collectionId, query).subscribe(() => {
            this.notifyService.success('Added query to collection.');
            this.store.dispatch(new collectionActions.LoadCollectionsAction());
          });
        });
        return observableEmpty();
      }),
    );

  @Effect()
  updateQueryInCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.UPDATE_QUERY_IN_COLLECTION),
      withLatestFrom(this.store, (action: collectionActions.UpdateQueryInCollectionAction, state) => {
        return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
      }),
      switchMap(res => {
        this.windowService.getWindowExportData(res.windowId).subscribe(exportData => {
          const query = exportData;

          if (res.data.layout.collectionId && res.data.layout.windowIdInCollection) {
            this.collectionService.updateQuery(res.data.layout.collectionId, res.data.layout.windowIdInCollection, query).subscribe(() => {
              this.notifyService.success('Updated query in collection.');
              this.store.dispatch(new collectionActions.LoadCollectionsAction());
            });
          }
        });
        return observableEmpty();
      }),
    )

  @Effect()
  loadCollections$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.LOAD_COLLECTIONS),
      switchMap(action => {
        return this.collectionService.getAll().pipe(
          map(collections => new collectionActions.SetCollectionsAction({ collections })));
      }))
    ;

  @Effect()
  deleteQueryFromCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.DELETE_QUERY_FROM_COLLECTION),
      switchMap((action: collectionActions.DeleteQueryFromCollectionAction) => {
        return this.collectionService.deleteQuery(action.payload.collectionId, action.payload.query)
          .pipe(
            tap(() => this.notifyService.success('Deleted query from collection.')),
            map(() => new collectionActions.LoadCollectionsAction()),
          );
      })
    );

  @Effect()
  updateCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.UPDATE_COLLECTION),
      switchMap((action: collectionActions.UpdateCollectionAction) => {
        return this.collectionService.updateCollection(action.payload.collectionId, action.payload.collection)
          .pipe(
            tap(() => this.notifyService.success('Updated collection.')),
            map(() => new collectionActions.LoadCollectionsAction()),
          )
      })
    )

  @Effect()
  deleteCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.DELETE_COLLECTION),
      switchMap((action: collectionActions.DeleteCollectionAction) => {
        return this.collectionService.deleteCollection(action.payload.collectionId)
          .pipe(
            tap(() => this.notifyService.success('Deleted query from collection.')),
            map(() => new collectionActions.LoadCollectionsAction()),
          );
      })
    );

  @Effect()
  exportCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.EXPORT_COLLECTION),
      switchMap((action: collectionActions.ExportCollectionAction) => {
        this.collectionService.getExportCollectionData(action.payload.collectionId).subscribe(exportData => {
          if (exportData) {
            downloadJson(exportData, exportData.title, { fileType: 'agc' });
          }
        });
        return observableEmpty();
      })
    );

  @Effect()
  importCollection$: Observable<Action> = this.actions$
    .pipe(
      ofType(collectionActions.IMPORT_COLLECTION),
      switchMap(() => {
        openFile({ accept: '.agc' }).then((data: string) => {
          return this.collectionService.importCollectionDataFromJson(data)
            .subscribe(() => {
              this.notifyService.success('Successfully imported collection.');
              this.store.dispatch(new collectionActions.LoadCollectionsAction());
            }, (error) => {
              const errorMessage = error.message ? error.message : error.toString();
              this.notifyService.error(`Something went wrong importing collection. Error: ${errorMessage}`);
            });
        });
        return observableEmpty();
      })
    );

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private collectionService: QueryCollectionService,
    private windowService: WindowService,
    private notifyService: NotifyService,
  ) {}
}
