import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getLayout = (state: PerWindowState) => state.layout;
export const getIsLoading = createSelector(getLayout, layout => layout.isLoading);
export const getTitle = createSelector(getLayout, layout => layout.title);
