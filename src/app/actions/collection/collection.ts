import { Action } from '@ngrx/store';
import { IQuery, SortByOptions } from 'app/reducers/collection/collection';

export const CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION = 'CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION';
export const SAVE_QUERY_TO_COLLECTION = 'SAVE_QUERY_TO_COLLECTION';
export const UPDATE_QUERY_IN_COLLECTION = 'UPDATE_QUERY_IN_COLLECTION';
export const DELETE_QUERY_FROM_COLLECTION = 'DELETE_QUERY_FROM_COLLECTION';

export const DELETE_COLLECTION = 'DELETE_COLLECTION';
export const SET_COLLECTIONS = 'SET_COLLECTIONS';
export const LOAD_COLLECTIONS = 'LOAD_COLLECTIONS';
export const SET_ACTIVE_COLLECTION = 'SET_ACTIVE_COLLECTION';
export const UPDATE_COLLECTION = 'UPDATE_COLLECTION';

export const IMPORT_COLLECTION = 'IMPORT_COLLECTION';
export const EXPORT_COLLECTION = 'EXPORT_COLLECTION';

export const SORT_COLLECTIONS = 'SORT_COLLECTIONS';

export class CreateCollectionAndSaveQueryToCollectionAction implements Action {
  readonly type = CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION;

  constructor(public payload: { collectionTitle: string, windowId: string, windowTitle?: string }) {}
}

export class SaveQueryToCollectionAction implements Action {
  readonly type = SAVE_QUERY_TO_COLLECTION;

  constructor(public payload: { windowId: string, collectionId: number, windowTitle?: string }) {}
}

export class UpdateQueryInCollectionAction implements Action {
  readonly type = UPDATE_QUERY_IN_COLLECTION;

  constructor(public payload: { windowId: string }) {}
}

export class DeleteQueryFromCollectionAction implements Action {
  readonly type = DELETE_QUERY_FROM_COLLECTION;
  constructor(public payload: { collectionId: number, query: IQuery }) {}
}

export class DeleteCollectionAction implements Action {
  readonly type = DELETE_COLLECTION;
  constructor(public payload: { collectionId: number }) {}
}

export class SetCollectionsAction implements Action {
  readonly type = SET_COLLECTIONS;

  constructor(public payload: { collections: any[] }) {}
}

export class SetActiveCollectionAction implements Action {
  readonly type = SET_ACTIVE_COLLECTION;

  constructor(public payload: { collection: any }) {}
}

export class UpdateCollectionAction implements Action {
  readonly type = UPDATE_COLLECTION;

  constructor(public payload: { collectionId: number, collection: any }) {}
}

export class LoadCollectionsAction implements Action {
  readonly type = LOAD_COLLECTIONS;

  constructor() {}
}

export class ExportCollectionAction implements Action {
  readonly type = EXPORT_COLLECTION;

  constructor(public payload: { collectionId: number }) {}
}

export class ImportCollectionAction implements Action {
  readonly type = IMPORT_COLLECTION;
}

export class SortCollectionsAction implements Action {
  readonly type = SORT_COLLECTIONS;

  constructor(public payload: { sortBy: SortByOptions }) {}
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
  | ImportCollectionAction
  | SortCollectionsAction
  ;
