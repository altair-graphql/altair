import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { initialState } from './headers';

export const getHeaders = (state: PerWindowState) => state ? state.headers : { ...initialState };
