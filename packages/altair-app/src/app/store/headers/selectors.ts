import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { getInitialHeadersState } from './headers.reducer';

export const getHeaders = (state: PerWindowState) => state ? state.headers : { ...getInitialHeadersState() };
