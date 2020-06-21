import { Action as NGRXAction } from '@ngrx/store';
import { GraphQLSchema } from 'graphql';

export const SET_INTROSPECTION = 'SET_INTROSPECTION';
export const SET_INTROSPECTION_FROM_DB = 'SET_INTROSPECTION_FROM_DB';

export const SET_SCHEMA = 'SET_SCHEMA';
export const SET_SCHEMA_SDL = 'SET_SCHEMA_SDL';
export const SET_ALLOW_INTROSPECTION = 'SET_ALLOW_INTROSPECTION';
export const SET_INTROSPECTION_LAST_UPDATED_AT = 'SET_INTROSPECTION_LAST_UPDATED_AT';

export const EXPORT_SDL = 'EXPORT_SDL';
export const LOAD_SDL_SCHEMA = 'LOAD_SDL_SCHEMA';

export class SetIntrospectionAction implements NGRXAction {
  readonly type = SET_INTROSPECTION;

  constructor(public payload: any, public windowId: string) { }
}

export class SetIntrospectionFromDbAction implements NGRXAction {
  readonly type = SET_INTROSPECTION_FROM_DB;

  constructor(public payload: any, public windowId: string) { }
}

export class SetSchemaAction implements NGRXAction {
  readonly type = SET_SCHEMA;

  constructor(public windowId: string, public payload: GraphQLSchema) { }
}

export class SetSchemaSDLAction implements NGRXAction {
  readonly type = SET_SCHEMA_SDL;

  constructor(public windowId: string, public payload: { sdl: string }) { }
}

export class SetAllowIntrospectionAction implements NGRXAction {
  readonly type = SET_ALLOW_INTROSPECTION;

  constructor(public payload: any, public windowId: string) { }
}

export class SetIntrospectionLastUpdatedAtAction implements NGRXAction {
  readonly type = SET_INTROSPECTION_LAST_UPDATED_AT;

  constructor(public windowId: string, public payload: { epoch: number }) { }
}

export class ExportSDLAction implements NGRXAction {
  readonly type = EXPORT_SDL;

  constructor(public windowId: string) { }
}

export class LoadSDLSchemaAction implements NGRXAction {
  readonly type = LOAD_SDL_SCHEMA;

  constructor(public windowId: string) {}
}

export type Action =
  | SetIntrospectionAction
  | SetIntrospectionFromDbAction
  | SetSchemaAction
  | SetSchemaSDLAction
  | SetAllowIntrospectionAction
  | SetIntrospectionLastUpdatedAtAction
  | ExportSDLAction
  | LoadSDLSchemaAction
  ;
