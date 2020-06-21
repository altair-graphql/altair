import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IQueryCollection } from 'app/store/collection/collection.reducer';

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

  clearAllLocalData() {
    // Clear indexedDb
    Dexie.getDatabaseNames()
      .then(names => {
        names.forEach(name => {
          const db = new Dexie(name);
          db.delete().catch(() => {});
        });
      });

    localStorage.clear();
  }

}

