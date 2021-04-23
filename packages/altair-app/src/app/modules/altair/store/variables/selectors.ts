import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '../state.interfaces';
import { getInitialState } from './variables.reducer';

export const getVariables = (state: PerWindowState) => state ? state.variables : getInitialState();
