import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';

export const getSchemaState = (state: PerWindowState) => state.schema;
export const getSchema = createSelector(getSchemaState, state => state.schema);
export const getIntrospection = createSelector(getSchemaState, state => state.introspection);
export const allowIntrospection = createSelector(getSchemaState, state => state.allowIntrospection);
