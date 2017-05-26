import { Action } from '@ngrx/store';

export const SET_INTROSPECTION = 'SET_INTROSPECTION';
export const SET_SCHEMA = 'SET_SCHEMA';

export class SetIntrospectionAction implements Action {
    readonly type = SET_INTROSPECTION;

    constructor(public payload: any) {}
}

export class SetSchemaAction implements Action {
    readonly type = SET_SCHEMA;

    constructor(public payload: any) {}
}
