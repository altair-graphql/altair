import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export const selectCollectionState = (state: RootState) => state.collection;
export const selectCollections = createSelector(selectCollectionState, collectionState => collectionState.list || []);
export const selectSortBy = createSelector(selectCollectionState, (collectionState) => collectionState.sortBy);
export const selectSortedCollections = createSelector(selectCollections, selectSortBy, (collections, sortBy) => {
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
});
