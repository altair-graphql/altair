import { Injectable } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import Dexie from 'dexie';

interface ISelectedFile {
  id: string;
  windowId: string;
  data: File[];
}

@Injectable()
export class StorageService extends Dexie {
  queryCollections: Dexie.Table<IQueryCollection, number | string>;
  appState: Dexie.Table<{ key: string; value: unknown }, string>;
  selectedFiles: Dexie.Table<ISelectedFile, string>;

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

  clearAllLocalData() {
    // Clear indexedDb
    Dexie.getDatabaseNames().then((names) => {
      names.forEach((name) => {
        const db = new Dexie(name);
        db.delete().catch(() => {});
      });
    });

    localStorage.clear();
  }
}
