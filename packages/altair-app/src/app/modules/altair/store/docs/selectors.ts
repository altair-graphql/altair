import { createSelector } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './docs.reducer';

export const getDocsState = (state: PerWindowState) =>
  state ? state.docs : { ...getInitialState() };
export const selectShowDocs = createSelector(
  getDocsState,
  (state) => state.showDocs
);
export const selectDocView = createSelector(
  getDocsState,
  (state) => state.docView || getInitialState().docView
);
export const selectDocsLoading = createSelector(
  getDocsState,
  (state) => state.isLoading
);
