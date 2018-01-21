import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getVariables = (state: PerWindowState) => state.variables.variables;
