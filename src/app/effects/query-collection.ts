
import {empty as observableEmpty,  Observable } from 'rxjs';

import {map, withLatestFrom, switchMap, tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';

import * as fromRoot from '../reducers';

import * as collectionActions from '../actions/collection/collection';
import { QueryCollectionService, WindowService, NotifyService } from '../services';


@Injectable()
export class QueryCollectionEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  createCollectionAndSaveQueryToCollection$: Observable<Action> = this.actions$
    .ofType(collectionActions.CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION)
    .pipe(
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
    .ofType(collectionActions.SAVE_QUERY_TO_COLLECTION)
    .pipe(
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
  loadCollections$: Observable<Action> = this.actions$
    .ofType(collectionActions.LOAD_COLLECTIONS).pipe(
    switchMap(action => {
      return this.collectionService.getAll().pipe(
        map(collections => new collectionActions.SetCollectionsAction({ collections })));
    }));

  @Effect()
  deleteQueryFromCollection$: Observable<Action> = this.actions$
    .ofType(collectionActions.DELETE_QUERY_FROM_COLLECTION).pipe(
    switchMap((action: collectionActions.DeleteQueryFromCollectionAction) => {
      return this.collectionService.deleteQuery(action.payload.collectionId, action.payload.query)
        .pipe(
          tap(() => this.notifyService.success('Deleted query from collection.')),
          map(() => new collectionActions.LoadCollectionsAction()),
        );
    }));

  @Effect()
  deleteCollection$: Observable<Action> = this.actions$
    .ofType(collectionActions.DELETE_COLLECTION).pipe(
    switchMap((action: collectionActions.DeleteCollectionAction) => {
      return this.collectionService.deleteCollection(action.payload.collectionId)
        .pipe(
          tap(() => this.notifyService.success('Deleted query from collection.')),
          map(() => new collectionActions.LoadCollectionsAction()),
        );
    }));

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private collectionService: QueryCollectionService,
    private windowService: WindowService,
    private notifyService: NotifyService,
  ) {}
}
