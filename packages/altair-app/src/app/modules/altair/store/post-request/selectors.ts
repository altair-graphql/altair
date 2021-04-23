import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '../state.interfaces';
import { getInitialState } from './post-request.reducer';

export const getPostRequest = (state: PerWindowState) => state ? state.postRequest : { ...getInitialState() };
