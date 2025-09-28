import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { selectCollections } from '../collection/selectors';

export const selectCollectionsMetaState = (state: RootState) =>
  state.collectionsMeta;
export const selectCollectionsSortBy = createSelector(
  selectCollectionsMetaState,
  (collectionsMetaState) => collectionsMetaState.collectionsSortBy
);
export const selectQueriesSortBy = createSelector(
  selectCollectionsMetaState,
  (collectionsMetaState) => collectionsMetaState.queriesSortBy
);
export const selectSortedCollections = createSelector(
  selectCollections,
  selectCollectionsSortBy,
  (orig, sortBy) => {
    const collections = [...orig];
    switch (sortBy) {
      case 'a-z':
        return collections.sort((a, b) => {
          const aTitle = a.title?.toLowerCase() || '';
          const bTitle = b.title?.toLowerCase() || '';

          return aTitle.localeCompare(bTitle);
        });
      case 'z-a':
        return collections.sort((a, b) => {
          const aTitle = a.title?.toLowerCase() || '';
          const bTitle = b.title?.toLowerCase() || '';

          return bTitle.localeCompare(aTitle);
        });
      case 'newest':
        return collections.sort((a, b) => {
          const aTimeStamp = a.updated_at || 0;
          const bTimeStamp = b.updated_at || 0;

          return bTimeStamp - aTimeStamp; // Newest first (descending)
        });
      case 'oldest':
        return collections.sort((a, b) => {
          const aTimeStamp = a.updated_at || 0;
          const bTimeStamp = b.updated_at || 0;

          return aTimeStamp - bTimeStamp; // Oldest first (ascending)
        });
      default:
        return collections;
    }
  }
);
