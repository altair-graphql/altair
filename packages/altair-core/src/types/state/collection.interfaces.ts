import { ExportWindowState } from './window.interfaces';

export type SortByOptions = 'a-z' | 'z-a' | 'newest' | 'oldest';

export interface CollectionState {
  list: IQueryCollection[];
  activeCollection: any;
  sortBy: SortByOptions;
}

export interface IQuery extends ExportWindowState {
  id?: number;
  created_at?: number;
  updated_at?: number;
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

export interface ExportCollectionState extends IQueryCollection {
  version: 1;
  type: 'collection';
}
