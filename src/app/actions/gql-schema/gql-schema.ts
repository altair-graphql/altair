import { Action } from '@ngrx/store';

export const SET_INTROSPECTION = 'SET_INTROSPECTION';
export const SET_INTROSPECTION_FROM_DB = 'SET_INTROSPECTION_FROM_DB';

export const SET_SCHEMA = 'SET_SCHEMA';
export const SET_ALLOW_INTROSPECTION = 'SET_ALLOW_INTROSPECTION';

export class SetIntrospectionAction implements Action {
    readonly type = SET_INTROSPECTION;

    constructor(public payload: any, public windowId: string) {}
}

export class SetIntrospectionFromDbAction implements Action {
    readonly type = SET_INTROSPECTION_FROM_DB;

    constructor(public payload: any, public windowId: string) {}
}

export class SetSchemaAction implements Action {
    readonly type = SET_SCHEMA;

    constructor(public windowId: string, public payload: any) {}
}

export class SetAllowIntrospectionAction implements Action {
    readonly type = SET_ALLOW_INTROSPECTION;

    constructor(public payload: any, public windowId: string) {}
}

export type Action = SetIntrospectionAction | SetIntrospectionFromDbAction | SetSchemaAction | SetAllowIntrospectionAction;
