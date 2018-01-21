import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getQueryState = (state: PerWindowState) => state.query;
export const getQueryResult = createSelector(getQueryState, state => state.response);
