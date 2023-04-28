import { Action as NGRXAction } from '@ngrx/store';
import { SortByOptions } from 'altair-graphql-core/build/types/state/collection.interfaces';
export const UPDATE_COLLECTIONS_SORT_BY = 'UPDATE_COLLECTIONS_SORT_BY';
export const UPDATE_QUERIES_SORT_BY = 'UPDATE_QUERIES_SORT_BY';

export class UpdateCollectionsSortByAction implements NGRXAction {
  readonly type = UPDATE_COLLECTIONS_SORT_BY;

  constructor(public payload: { sortBy: SortByOptions }) {}
}

export class UpdateQueriesSortByAction implements NGRXAction {
  readonly type = UPDATE_QUERIES_SORT_BY;

  constructor(public payload: { sortBy: SortByOptions }) {}
}

export type Action = UpdateCollectionsSortByAction | UpdateQueriesSortByAction;
