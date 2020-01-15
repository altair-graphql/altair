import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { getInitialState } from './variables';

export const getVariables = (state: PerWindowState) => state ? state.variables : getInitialState();
