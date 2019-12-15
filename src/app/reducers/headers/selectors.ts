import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { getInitialHeadersState } from './headers';

export const getHeaders = (state: PerWindowState) => state ? state.headers : { ...getInitialHeadersState() };
