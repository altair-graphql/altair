import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export const selectCollectionState = (state: RootState) => state.collection;
export const selectCollections = createSelector(
  selectCollectionState,
  (collectionState) => collectionState.list || []
);
export const selectCollection = (collectionId: string) =>
  createSelector(selectCollectionState, (collectionState) =>
    collectionState.list.find((collection) => collection.id === collectionId)
  );
