import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './pre-request.reducer';

export const getPreRequest = (state: PerWindowState) => state ? state.preRequest : { ...getInitialState() };
