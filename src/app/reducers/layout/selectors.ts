import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { initialState } from './layout';

export const getLayout = (state: PerWindowState) => state ? state.layout : { ...initialState };
export const getIsLoading = createSelector(getLayout, layout => layout.isLoading);
export const getTitle = createSelector(getLayout, layout => layout.title);
