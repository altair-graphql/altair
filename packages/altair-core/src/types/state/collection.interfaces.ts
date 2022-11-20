import { PostrequestState } from './postrequest.interfaces';
import { PrerequestState } from './prerequest.interfaces';
import { ExportWindowState } from './window.interfaces';

export type SortByOptions = 'a-z' | 'z-a' | 'newest' | 'oldest' | 'none';

export type EntityStorageType = 'local' | 'firestore';

export interface CollectionState {
  list: IQueryCollection[];
  activeCollection: any;
  sortBy: SortByOptions;
}

export interface IQuery extends ExportWindowState {
  id?: string;
  storageType?: EntityStorageType;
  created_at?: number;
  updated_at?: number;
}

export interface IRemoteQuery extends IQuery {
  id?: string;
  collectionId: string;
  ownerUid: string;
}

export interface IQueryCollection {
  id?: string;
  title: string;
  queries: IQuery[];
  description?: string;

  preRequest?: PrerequestState;
  postRequest?: PostrequestState;

  /**
   * path of the collection in the collection tree
   * e.g. '/123/456'
   */
  parentPath?: string;

  storageType?: EntityStorageType;
  created_at?: number;
  updated_at?: number;
}

export interface IRemoteQueryCollection
  extends Omit<IQueryCollection, 'parentPath' | 'queries'> {
  id?: string;
  parentCollectionId?: string;
  ownerUid: string;
}

export interface IQueryCollectionTree extends IQueryCollection {
  id: string;
  collections?: IQueryCollectionTree[];
}

export interface ExportCollectionState extends IQueryCollectionTree {
  version: 1;
  type: 'collection';
}
