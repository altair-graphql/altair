import { Action } from '@ngrx/store';

export const SAVE_URL_SUCCESS = 'SAVE_URL_SUCCESS';
export const SAVE_QUERY_SUCCESS = 'SAVE_QUERY_SUCCESS';
export const SAVE_INTROSPECTION_SUCCESS = 'SAVE_INTROSPECTION_SUCCESS';

export class SaveUrlSuccessAction implements Action {
    readonly type = SAVE_URL_SUCCESS;
}

export class SaveQuerySuccessAction implements Action {
    readonly type = SAVE_QUERY_SUCCESS;
}

export class SaveIntrospectionSuccessAction implements Action {
    readonly type = SAVE_INTROSPECTION_SUCCESS;
}
