import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { initialState } from './docs';

export const getDocsState = (state: PerWindowState) => state ? state.docs : { ...initialState };
export const getShowDocs = createSelector(getDocsState, state => state.showDocs);
export const getDocsLoading = createSelector(getDocsState, state => state.isLoading);
