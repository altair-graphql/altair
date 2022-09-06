import { Injectable } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import Dexie from 'dexie';

interface ISelectedFile {
  id: string;
  windowId: string;
  data: File[];
}

interface BaseActionLog {
  id?: number;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  serverId?: string;
}
interface QueryActionLog extends BaseActionLog {
  type: 'query';
  collectionServerId?: string;
}
interface CollectionActionLog extends BaseActionLog {
  type: 'collection';
}

type ActionLog = QueryActionLog | CollectionActionLog;

@Injectable()
export class StorageService extends Dexie {
  queryCollections: Dexie.Table<IQueryCollection, number | string>;
  appState: Dexie.Table<{ key: string; value: any }, string>;
  selectedFiles: Dexie.Table<ISelectedFile, string>;

  // used for tracking local changes that should be synced to remote,
  // primary use case is for query collections. For this use case, we only care about entities (queries, collections)
  // that have server IDs since those are the ones we would want to track changes to, otherwise we just assume they are new.
  localActionLogs: Dexie.Table<ActionLog, number>;

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
