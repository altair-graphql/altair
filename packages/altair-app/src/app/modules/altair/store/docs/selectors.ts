import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './docs.reducer';

export const getDocsState = (state: PerWindowState) => state ? state.docs : { ...getInitialState() };
export const getShowDocs = createSelector(getDocsState, state => state.showDocs);
export const getDocView = createSelector(getDocsState, state => state.docView || getInitialState().docView);
export const getDocsLoading = createSelector(getDocsState, state => state.isLoading);
