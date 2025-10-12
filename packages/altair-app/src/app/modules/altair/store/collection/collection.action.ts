import { Action as NGRXAction } from '@ngrx/store';
import { TeamId } from 'altair-graphql-core/build/types/state/account.interfaces';
import {
  IQuery,
  IQueryCollection,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { WorkspaceId } from 'altair-graphql-core/build/types/state/workspace.interface';

export const CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION =
  'CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION';
export const SAVE_QUERY_TO_COLLECTION = 'SAVE_QUERY_TO_COLLECTION';
export const UPDATE_QUERY_IN_COLLECTION = 'UPDATE_QUERY_IN_COLLECTION';
export const DELETE_QUERY_FROM_COLLECTION = 'DELETE_QUERY_FROM_COLLECTION';

export const DELETE_COLLECTION = 'DELETE_COLLECTION';
export const SET_COLLECTIONS = 'SET_COLLECTIONS';
export const LOAD_COLLECTIONS = 'LOAD_COLLECTIONS';
export const SET_ACTIVE_COLLECTION = 'SET_ACTIVE_COLLECTION';
export const UPDATE_COLLECTION = 'UPDATE_COLLECTION';

export const IMPORT_COLLECTIONS = 'IMPORT_COLLECTIONS';
export const EXPORT_COLLECTION = 'EXPORT_COLLECTION';

export const SORT_COLLECTIONS = 'SORT_COLLECTIONS';

export const SYNC_REMOTE_COLLECTIONS_TO_LOCAL = 'SYNC_REMOTE_COLLECTIONS_TO_LOCAL';
export const SYNC_LOCAL_COLLECTION_TO_REMOTE = 'SYNC_LOCAL_COLLECTION_TO_REMOTE';

export class CreateCollectionAndSaveQueryToCollectionAction implements NGRXAction {
  readonly type = CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION;

  constructor(
    public payload: {
      collectionTitle: string;
      windowId: string;
      windowTitle?: string;
      parentCollectionId?: string;
      workspaceId: WorkspaceId;
      teamId?: TeamId;
    }
  ) {}
}

export class SaveQueryToCollectionAction implements NGRXAction {
  readonly type = SAVE_QUERY_TO_COLLECTION;

  constructor(
    public payload: {
      windowId: string;
      collectionId: string;
      windowTitle?: string;
    }
  ) {}
}

export class UpdateQueryInCollectionAction implements NGRXAction {
  readonly type = UPDATE_QUERY_IN_COLLECTION;

  constructor(public payload: { windowId: string }) {}
}

export class DeleteQueryFromCollectionAction implements NGRXAction {
  readonly type = DELETE_QUERY_FROM_COLLECTION;
  constructor(public payload: { collectionId: string; query: IQuery }) {}
}

export class DeleteCollectionAction implements NGRXAction {
  readonly type = DELETE_COLLECTION;
  constructor(public payload: { collectionId: string }) {}
}

export class SetCollectionsAction implements NGRXAction {
  readonly type = SET_COLLECTIONS;

  constructor(public payload: { collections: IQueryCollection[] }) {}
}

export class SetActiveCollectionAction implements NGRXAction {
  readonly type = SET_ACTIVE_COLLECTION;

  constructor(public payload: { collection: IQueryCollection }) {}
}

export class UpdateCollectionAction implements NGRXAction {
  readonly type = UPDATE_COLLECTION;

  constructor(
    public payload: { collectionId: string; collection: IQueryCollection }
  ) {}
}

export class LoadCollectionsAction implements NGRXAction {
  readonly type = LOAD_COLLECTIONS;
}

export class ExportCollectionAction implements NGRXAction {
  readonly type = EXPORT_COLLECTION;

  constructor(public payload: { collectionId: string }) {}
}

export class ImportCollectionsAction implements NGRXAction {
  readonly type = IMPORT_COLLECTIONS;
}

export class SyncRemoteCollectionsToLocalAction implements NGRXAction {
  readonly type = SYNC_REMOTE_COLLECTIONS_TO_LOCAL;
}

export class SyncLocalCollectionToRemoteAction implements NGRXAction {
  readonly type = SYNC_LOCAL_COLLECTION_TO_REMOTE;

  constructor(public payload: { collection: IQueryCollection }) {}
}

export type Action =
  | CreateCollectionAndSaveQueryToCollectionAction
  | SaveQueryToCollectionAction
  | UpdateQueryInCollectionAction
  | DeleteQueryFromCollectionAction
  | DeleteCollectionAction
  | SetCollectionsAction
  | SetActiveCollectionAction
  | UpdateCollectionAction
  | LoadCollectionsAction
  | ExportCollectionAction
  | ImportCollectionsAction
  | SyncRemoteCollectionsToLocalAction
  | SyncLocalCollectionToRemoteAction;
