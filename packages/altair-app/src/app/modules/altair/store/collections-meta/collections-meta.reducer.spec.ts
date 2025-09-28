import { collectionsMetaReducer, getInitialState } from './collections-meta.reducer';
import * as collectionsMetaActions from './collections-meta.action';
import { CollectionsMetaState } from 'altair-graphql-core/build/types/state/collections-meta.interfaces';

describe('CollectionsMetaReducer', () => {
  let initialState: CollectionsMetaState;

  beforeEach(() => {
    initialState = getInitialState();
  });

  it('should return the initial state', () => {
    expect(initialState).toEqual({
      collectionsSortBy: 'newest',
      queriesSortBy: 'newest',
    });
  });

  it('should update collections sort by', () => {
    const action = new collectionsMetaActions.UpdateCollectionsSortByAction({
      sortBy: 'a-z',
    });

    const result = collectionsMetaReducer(initialState, action);

    expect(result).toEqual({
      collectionsSortBy: 'a-z',
      queriesSortBy: 'newest',
    });
  });

  it('should update queries sort by', () => {
    const action = new collectionsMetaActions.UpdateQueriesSortByAction({
      sortBy: 'z-a',
    });

    const result = collectionsMetaReducer(initialState, action);

    expect(result).toEqual({
      collectionsSortBy: 'newest',
      queriesSortBy: 'z-a',
    });
  });

  it('should preserve existing state for unknown actions', () => {
    const currentState: CollectionsMetaState = {
      collectionsSortBy: 'oldest',
      queriesSortBy: 'a-z',
    };

    const unknownAction = { type: 'UNKNOWN_ACTION' } as any;

    const result = collectionsMetaReducer(currentState, unknownAction);

    expect(result).toBe(currentState);
  });

  it('should update collections sort by while preserving queries sort by', () => {
    const currentState: CollectionsMetaState = {
      collectionsSortBy: 'oldest',
      queriesSortBy: 'z-a',
    };

    const action = new collectionsMetaActions.UpdateCollectionsSortByAction({
      sortBy: 'a-z',
    });

    const result = collectionsMetaReducer(currentState, action);

    expect(result).toEqual({
      collectionsSortBy: 'a-z',
      queriesSortBy: 'z-a',
    });
  });
});