import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IQueryCollection } from '../../store/collection/collection.reducer';

@Injectable()
export class StorageService extends Dexie {
  queryCollections: Dexie.Table<IQueryCollection, number>;
  appState: Dexie.Table<{ key: string, value: any }, string>;

  constructor() {
    super('AltairDB');
    this.schema();
  }

  schema() {
    this.version(2).stores({
      queryCollections: '++id, title',
      appState: 'key',
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

