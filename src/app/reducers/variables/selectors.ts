import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { initialState } from './variables';

export const getVariables = (state: PerWindowState) => state ? state.variables : initialState;
