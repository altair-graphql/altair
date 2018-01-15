import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getDocsState = (state: PerWindowState) => state.docs;
export const getShowDocs = createSelector(getDocsState, state => state.showDocs);
export const getDocsLoading = createSelector(getDocsState, state => state.isLoading);
