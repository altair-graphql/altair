import { Injectable } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import Dexie, { liveQuery } from 'dexie';
import { merge, scheduled } from 'rxjs';

interface ISelectedFile {
  id: string;
  windowId: string;
  data: File[];
}

@Injectable()
export class StorageService extends Dexie {
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  queryCollections!: Dexie.Table<IQueryCollection, number | string>;
  appState!: Dexie.Table<{ key: string; value: unknown }, string>;
  selectedFiles!: Dexie.Table<ISelectedFile, string>;

  constructor() {
    super('AltairDB');
    this.schema();
  }

  schema() {
    this.version(5).stores({
      queryCollections: '++id, title, parentPath',
      appState: 'key',
      selectedFiles: 'id, windowId',
      localActionLogs: '++id',
    });
  }

  now() {
    return +new Date();
  }

  changes() {
    return liveQuery(() => this.appState.toArray());
  }

  clearAllLocalData() {
    // Clear indexedDb
    // Dexie.getDatabaseNames() was removed in Dexie v4; use indexedDB.databases() instead
    indexedDB.databases().then((dbs) => {
      dbs.forEach(({ name }) => {
        if (name) {
          const db = new Dexie(name);
          db.delete().catch(() => {});
        }
      });
    });

    localStorage.clear();
  }
}
