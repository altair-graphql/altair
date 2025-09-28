import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { selectCollections } from '../collection/selectors';

export const selectCollectionsMetaState = (state: RootState) =>
  state.collectionsMeta;
export const selectCollectionsSortBy = createSelector(
  selectCollectionsMetaState,
  (collectionsMetaState) => collectionsMetaState.collectionsSortBy
);
export const selectSortedCollections = createSelector(
  selectCollections,
  selectCollectionsSortBy,
  (orig, sortBy) => {
    const collections = [...orig];
    switch (sortBy) {
      case 'a-z':
        return collections.sort((a, b) => {
          const aTitle = a.title.toLowerCase() || a.updated_at;
          const bTitle = b.title.toLowerCase() || b.updated_at;

          if (aTitle && bTitle) {
            if (aTitle > bTitle) {
              return 1;
            }
            if (aTitle < bTitle) {
              return -1;
            }
          }
          return 0;
        });
      case 'z-a':
        return collections.sort((a, b) => {
          const aTitle = a.title.toLowerCase() || a.updated_at;
          const bTitle = b.title.toLowerCase() || b.updated_at;

          if (aTitle && bTitle) {
            if (aTitle > bTitle) {
              return -1;
            }
            if (aTitle < bTitle) {
              return 1;
            }
          }
          return 0;
        });
      case 'newest':
        return collections.sort((a, b) => {
          const aTimeStamp = a.updated_at;
          const bTimeStamp = b.updated_at;

          if (aTimeStamp && bTimeStamp) {
            if (aTimeStamp > bTimeStamp) {
              return -1;
            }
            if (aTimeStamp < bTimeStamp) {
              return 1;
            }
          }
          return 0;
        });
      case 'oldest':
        return collections.sort((a, b) => {
          const aTimeStamp = a.updated_at;
          const bTimeStamp = b.updated_at;

          if (aTimeStamp && bTimeStamp) {
            if (aTimeStamp > bTimeStamp) {
              return 1;
            }
            if (aTimeStamp < bTimeStamp) {
              return -1;
            }
          }
          return 0;
        });
      default:
        return collections;
    }
  }
);
