import { Injectable } from '@angular/core';
import { StorageService, IQueryCollection } from '../storage/storage.service';

@Injectable()
export class QueryCollectionService {

  constructor(
    private storage: StorageService
  ) { }

  create(collection: IQueryCollection) {
    const now = this.storage.now();
    return this.storage.queryCollections.add({ ...collection, created_at: now, updated_at: now });
  }

  addQuery(collectionId: number, query) {
    const now = this.storage.now();
    return this.storage.queryCollections.get(collectionId).then(collection => {
      return this.storage.queryCollections.put({ ...collection, queries: [ ...collection.queries, query ], updated_at: now });
    });
  }

  getAll() {
    return this.storage.queryCollections.toArray();
  }

}
