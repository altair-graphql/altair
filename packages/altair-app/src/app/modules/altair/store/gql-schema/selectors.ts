import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './gql-schema.reducer';

export const getSchemaState = (state: PerWindowState) => state ? state.schema : { ...getInitialState() };
export const getSchema = createSelector(getSchemaState, state => state.schema);
export const getIntrospection = createSelector(getSchemaState, state => state.introspection);
export const allowIntrospection = createSelector(getSchemaState, state => state.allowIntrospection);
export const getSchemaLastUpdatedAt = createSelector(getSchemaState, state => state.lastUpdatedAt);
export const getSDL = createSelector(getSchemaState, state => state.sdl);
