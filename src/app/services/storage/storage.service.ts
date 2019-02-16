import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IQueryCollection } from 'app/reducers/collection';

@Injectable()
export class StorageService extends Dexie {
  queryCollections: Dexie.Table<IQueryCollection, number>;

  constructor() {
    super('AltairDB');
    this.schema();
  }

  schema() {
    this.version(1).stores({
      queryCollections: '++id, title'
    });
  }

  now() {
    return +(new Date());
  }

}

