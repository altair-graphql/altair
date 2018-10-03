import { Action } from '@ngrx/store';

export const CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION = 'CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION';
export const SAVE_QUERY_TO_COLLECTION = 'SAVE_QUERY_TO_COLLECTION';
export const DELETE_QUERY_FROM_COLLECTION = 'DELETE_QUERY_FROM_COLLECTION';

export const SET_COLLECTIONS = 'SET_COLLECTIONS';
export const LOAD_COLLECTIONS = 'LOAD_COLLECTIONS';

export class CreateCollectionAndSaveQueryToCollectionAction implements Action {
  readonly type = CREATE_COLLECTION_AND_SAVE_QUERY_TO_COLLECTION;

  constructor(public payload: { collectionTitle: string, windowId: string, windowTitle?: string }) {}
}

export class SaveQueryToCollectionAction implements Action {
  readonly type = SAVE_QUERY_TO_COLLECTION;

  constructor(public payload: { windowId: string, collectionId: number, windowTitle?: string }) {}
}

export class DeleteQueryFromCollectionAction implements Action {
  readonly type = DELETE_QUERY_FROM_COLLECTION;
  constructor(public payload: { collectionId: number, query }) {}
}

export class SetCollectionsAction implements Action {
  readonly type = SET_COLLECTIONS;

  constructor(public payload: { collections: any[] }) {}
}

export class LoadCollectionsAction implements Action {
  readonly type = LOAD_COLLECTIONS;

  constructor() {}
}

export type Action =
  CreateCollectionAndSaveQueryToCollectionAction |
  SaveQueryToCollectionAction |
  DeleteQueryFromCollectionAction |
  SetCollectionsAction |
  LoadCollectionsAction;
