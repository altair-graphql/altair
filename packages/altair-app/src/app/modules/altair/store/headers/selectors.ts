import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '../state.interfaces';
import { getInitialHeadersState } from './headers.reducer';

export const getHeaders = (state: PerWindowState) => state ? state.headers : { ...getInitialHeadersState() };
