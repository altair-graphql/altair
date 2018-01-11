import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getHeaders = (state: PerWindowState) => state.headers;
