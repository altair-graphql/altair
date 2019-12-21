import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { getInitialState } from './layout';

export const getLayout = (state: PerWindowState) => state ? state.layout : { ...getInitialState() };
export const getIsLoading = createSelector(getLayout, layout => layout.isLoading);
export const getTitle = createSelector(getLayout, layout => layout.title);
