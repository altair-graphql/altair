import { Injectable } from '@angular/core';
import Dexie from 'dexie';

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

export interface IQueryCollection {
  id?: number;
  title: string;
  description?: string;
  queries: any[];
  collections?: IQueryCollection[];

  created_at?: number;
  updated_at?: number;
}
