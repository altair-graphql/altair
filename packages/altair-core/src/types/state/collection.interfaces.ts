import { BaseDocument, BaseOwnableDocument } from '../shared';
import { PostrequestState } from './postrequest.interfaces';
import { PrerequestState } from './prerequest.interfaces';
import { ExportWindowState } from './window.interfaces';
import { HeaderState } from './header.interfaces';

export type SortByOptions = 'a-z' | 'z-a' | 'newest' | 'oldest' | 'none';

export type EntityStorageType = 'local' | 'api';

export interface CollectionState {
  list: IQueryCollection[];
  activeCollection?: IQueryCollection;
}

export interface IQuery extends ExportWindowState {
  id?: string;
  storageType?: EntityStorageType;
  created_at?: number;
  updated_at?: number;
}

export interface IRemoteQuery extends IQuery, BaseOwnableDocument {
  id: string;
  collectionId: string;
  teamUid?: string;
}

export interface IQueryCollection extends BaseDocument {
  title: string;
  queries: IQuery[];
  description?: string;

  preRequest?: PrerequestState;
  postRequest?: PostrequestState;

  /**
   * Headers to be inherited by all queries in this collection
   */
  headers?: HeaderState;

  /**
   * path of the collection in the collection tree
   * e.g. '/123/456'
   */
  parentPath?: string;

  storageType?: EntityStorageType;

  workspaceId?: string;
}

export interface IRemoteQueryCollection
  extends Omit<IQueryCollection, 'parentPath' | 'queries'>,
    BaseOwnableDocument {
  parentCollectionId?: string;
  teamUid?: string;
}

export interface IQueryCollectionTree extends IQueryCollection {
  id: string;
  collections?: IQueryCollectionTree[];
}

export interface ExportCollectionState extends IQueryCollectionTree {
  version: 1;
  type: 'collection';
}
