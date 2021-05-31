import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IQueryCollection } from '../../store/collection/collection.reducer';

interface ISelectedFile {
  id: string;
  windowId: string;
  data: File[];
}

@Injectable()
export class StorageService extends Dexie {
  queryCollections: Dexie.Table<IQueryCollection, number>;
  appState: Dexie.Table<{ key: string, value: any }, string>;
  selectedFiles: Dexie.Table<ISelectedFile, string>;

  constructor() {
    super('AltairDB');
    this.schema();
  }

  schema() {
    this.version(3).stores({
      queryCollections: '++id, title',
      appState: 'key',
      selectedFiles: 'id, windowId',
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

