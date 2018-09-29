import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../reducers';

import * as collectionActions from '../actions/collection/collection';
import { QueryCollectionService, WindowService, NotifyService } from '../services';


@Injectable()
export class QueryCollectionEffects {

  // Updates windowsMeta with window IDs when a window is added
  @Effect()
  createCollectionAndSaveQueryToCollection$: Observable<Action> = this.actions$
    .ofType(collectionActions.CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION)
    .withLatestFrom(this.store, (action: collectionActions.CreateCollectionAndSaveQueryToCollectionAction, state) => {
        return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
    })
    .switchMap(res => {
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
        }).then(() => {
          this.notifyService.success('Created collection.');
          this.collectionService.getAll()
            .then(collections => this.store.dispatch(new collectionActions.SetCollectionsAction({ collections })));
        }).catch(err => console.log(err));
      });
      return Observable.empty();
    });

  @Effect()
  saveQueryToCollection$: Observable<Action> = this.actions$
    .ofType(collectionActions.SAVE_QUERY_TO_COLLECTION)
    .withLatestFrom(this.store, (action: collectionActions.SaveQueryToCollectionAction, state) => {
      return { data: state.windows[action.payload.windowId], windowId: action.payload.windowId, action };
    })
    .switchMap(res => {
      this.windowService.getWindowExportData(res.windowId).subscribe(exportData => {
        const query = exportData;
        if (res.action.payload.windowTitle) {
          query.windowName = res.action.payload.windowTitle;
        }
        this.collectionService.addQuery(res.action.payload.collectionId, query).then(() => {
          this.notifyService.success('Added query to collection.');
          this.collectionService.getAll()
            .then(collections => this.store.dispatch(new collectionActions.SetCollectionsAction({ collections })));
        }).catch(err => console.log(err));
      });
      return Observable.empty();
    });

  @Effect()
  loadCollections$: Observable<Action> = this.actions$
    .ofType(collectionActions.LOAD_COLLECTIONS)
    .switchMap(action => {
      this.collectionService.getAll()
        .then(collections => this.store.dispatch(new collectionActions.SetCollectionsAction({ collections })));
      return Observable.empty();
    });

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private collectionService: QueryCollectionService,
    private windowService: WindowService,
    private notifyService: NotifyService,
  ) {}
}
