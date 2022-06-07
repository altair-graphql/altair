import { ExportWindowState } from './window.interfaces';

export type SortByOptions = 'a-z' | 'z-a' | 'newest' | 'oldest';

export interface CollectionState {
  list: IQueryCollection[];
  activeCollection: any;
  sortBy: SortByOptions;
}

export interface IQuery extends ExportWindowState {
  id?: string;
  serverId?: number;
  created_at?: number;
  updated_at?: number;
}

export interface IQueryCollection {
  id?: number | string;
  serverId?: number;
  title: string;
  queries: IQuery[];
  description?: string;

  /**
   * path of the collection in the collection tree
   * e.g. '/123/456'
   */
  parentPath?: string;

  created_at?: number;
  updated_at?: number;
}

export interface IQueryCollectionTree extends IQueryCollection {
  id: IQueryCollection['id'];
  collections?: IQueryCollectionTree[];
}

export interface ExportCollectionState extends IQueryCollectionTree {
  version: 1;
  type: 'collection';
}
