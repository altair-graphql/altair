import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './variables.reducer';

export const getVariables = (state: PerWindowState) => state ? state.variables : getInitialState();
