
import {from as observableFrom,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { StorageService, IQueryCollection } from '../storage/storage.service';
import * as uuid from 'uuid/v4';

// Handling hierarchical data
// https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database
@Injectable()
export class QueryCollectionService {

  constructor(
    private storage: StorageService
  ) { }

  create(collection: IQueryCollection) {
    const now = this.storage.now();
    return observableFrom(this.storage.queryCollections.add({ ...collection, created_at: now, updated_at: now }));
  }

  addQuery(collectionId: number, query): Observable<any> {
    const now = this.storage.now();
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        const uQuery = { ...query, id: uuid() };
        collection.queries.push(uQuery);
        collection.updated_at = now;
      })
    );
  }

  deleteQuery(collectionId: number, query): Observable<any> {
    return observableFrom(
      this.storage.queryCollections.where('id').equals(collectionId).modify(collection => {
        collection.queries = collection.queries.filter(collectionQuery => {
          if (query.id) {
            if (query.id === collectionQuery.id) {
              return false;
            }
          } else {
            // Added for backward compatibility. Initially queries didn't have ids. Remove after a while.
            if (query.windowName === collectionQuery.windowName) {
              return false;
            }
          }

          return true;
        });

        collection.updated_at = this.storage.now();
      })
    );
  }

  deleteCollection(collectionId: number) {
    return observableFrom(this.storage.queryCollections.delete(collectionId));
  }

  getAll() {
    return observableFrom(this.storage.queryCollections.toArray());
  }

}
