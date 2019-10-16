import { Action } from '@ngrx/store';
import { QueryEditorState } from 'app/reducers/query/query';

export const SET_URL = 'SET_URL';
export const SET_URL_FROM_DB = 'SET_URL_FROM_DB';
export const SET_HTTP_VERB = 'SET_HTTP_VERB';

export const SET_SUBSCRIPTION_URL = 'SET_SUBSCRIPTION_URL';

export const SEND_INTROSPECTION_QUERY_REQUEST = 'SEND_INTROSPECTION_QUERY_REQUEST';

export const SET_QUERY = 'SET_QUERY';
export const SET_QUERY_FROM_DB = 'SET_QUERY_FROM_DB';

export const SET_SELECTED_OPERATION = 'SET_SELECTED_OPERATION';

export const SET_QUERY_RESULT = 'SET_QUERY_RESULT';
export const PRETTIFY_QUERY = 'PRETTIFY_QUERY';
export const COMPRESS_QUERY = 'COMPRESS_QUERY';
export const COPY_AS_CURL = 'COPY_AS_CURL';
export const CONVERT_TO_NAMED_QUERY = 'CONVERT_TO_NAMED_QUERY';

export const SEND_QUERY_REQUEST = 'SEND_QUERY_REQUEST';
export const CANCEL_QUERY_REQUEST = 'CANCEL_QUERY_REQUEST';

export const START_SUBSCRIPTION = 'START_SUBSCRIPTION';
export const STOP_SUBSCRIPTION = 'STOP_SUBSCRIPTION';
export const SET_SUBSCRIPTION_CLIENT = 'SET_SUBSCRIPTION_CLIENT';
export const SET_SUBSCRIPTION_CONNECTION_PARAMS = 'SET_SUBSCRIPTION_CONNECTION_PARAMS';
export const ADD_SUBSCRIPTION_RESPONSE = 'ADD_SUBSCRIPTION_RESPONSE';
export const SET_SUBSCRIPTION_RESPONSE_LIST = 'SET_SUBSCRIPTION_RESPONSE_LIST';

export const SET_RESPONSE_STATS = 'SET_RESPONSE_STATS';
export const DOWNLOAD_RESULT = 'DOWNLOAD_RESULT';

export const HIDE_URL_ALERT = 'HIDE_URL_ALERT';
export const SHOW_URL_ALERT = 'SHOW_URL_ALERT';
export const HIDE_EDITOR_ALERT = 'HIDE_EDITOR_ALERT';
export const SHOW_EDITOR_ALERT = 'SHOW_EDITOR_ALERT';

export const SET_QUERY_OPERATIONS = 'SET_QUERY_OPERATIONS';
export const SET_QUERY_EDITOR_STATE = 'SET_QUERY_EDITOR_STATE';


export class SetUrlAction implements Action {
  readonly type = SET_URL;

  constructor(public payload: { url: string }, public windowId: string) {}
}

export class SetHTTPMethodAction implements Action {
  readonly type = SET_HTTP_VERB;

  constructor(public payload: { httpVerb: string }, public windowId: string) {}
}

export class SetUrlFromDbAction implements Action {
  readonly type = SET_URL_FROM_DB;

  constructor(public payload: { url: string }, public windowId: string) {}
}

export class SetSubscriptionUrlAction implements Action {
  readonly type = SET_SUBSCRIPTION_URL;

  constructor(public payload: { subscriptionUrl: string }, public windowId: string) { }
}

export class SendIntrospectionQueryRequestAction implements Action {
  readonly type = SEND_INTROSPECTION_QUERY_REQUEST;

  constructor(public windowId: string, public payload?) {}
}

export class SetQueryAction implements Action {
  readonly type = SET_QUERY;

  constructor(public payload: string, public windowId: string) {}
}

export class SetQueryFromDbAction implements Action {
  readonly type = SET_QUERY_FROM_DB;

  constructor(public payload: string, public windowId: string) {}
}

export class SetQueryResultAction implements Action {
  readonly type = SET_QUERY_RESULT;

  constructor(public payload: any, public windowId: string) {}
}

export class PrettifyQueryAction implements Action {
  readonly type = PRETTIFY_QUERY;

  constructor(public windowId: string, public payload?) {}
}

export class CompressQueryAction implements Action {
  readonly type = COMPRESS_QUERY;

  constructor(public windowId: string, public payload?) {}
}

export class CopyAsCurlAction implements Action {
  readonly type = COPY_AS_CURL;

  constructor(public windowId: string, public payload?) {}
}

export class ConvertToNamedQueryAction implements Action {
  readonly type = CONVERT_TO_NAMED_QUERY;

  constructor(public windowId: string, public payload?) {}
}

export class SendQueryRequestAction implements Action {
  readonly type = SEND_QUERY_REQUEST;

  constructor(public windowId: string, public payload?) {}
}

export class SetSelectedOperationAction implements Action {
  readonly type = SET_SELECTED_OPERATION;

  constructor(public windowId: string, public payload: { selectedOperation: string }) {}
}

export class SetResponseStatsAction implements Action {
  readonly type = SET_RESPONSE_STATS;

  constructor(public windowId: string, public payload: { responseTime: number, responseStatus: number, responseStatusText: string }) {}
}

export class StartSubscriptionAction implements Action {
  readonly type = START_SUBSCRIPTION;

  constructor(public windowId: string, public payload?) { }
}

export class StopSubscriptionAction implements Action {
  readonly type = STOP_SUBSCRIPTION;

  constructor(public windowId: string, public payload?) { }
}

export class SetSubscriptionConnectionParamsAction implements Action {
  readonly type = SET_SUBSCRIPTION_CONNECTION_PARAMS;

  constructor(public windowId: string, public payload: { connectionParams: string }) {}
}

export class SetSubscriptionClientAction implements Action {
  readonly type = SET_SUBSCRIPTION_CLIENT;

  constructor(public windowId: string, public payload: { subscriptionClient: any }) { }
}

export class AddSubscriptionResponseAction implements Action {
  readonly type = ADD_SUBSCRIPTION_RESPONSE;

  constructor(public windowId: string, public payload: { response: string, responseTime: number }) { }
}

export class SetSubscriptionResponseListAction implements Action {
  readonly type = SET_SUBSCRIPTION_RESPONSE_LIST;

  constructor(public windowId: string, public payload: { list: Array<any> }) { }
}

export class DownloadResultAction implements Action {
  readonly type = DOWNLOAD_RESULT;

  constructor(public windowId: string, public payload?) {}
}

export class CancelQueryRequestAction implements Action {
  readonly type = CANCEL_QUERY_REQUEST;

  constructor(public windowId: string, public payload?) {}
}

export class SetQueryOperationsAction implements Action {
  readonly type = SET_QUERY_OPERATIONS;

  constructor(public windowId: string, public payload: { operations: any[] }) {}
}

export class SetQueryEditorStateAction implements Action {
  readonly type = SET_QUERY_EDITOR_STATE;

  constructor(public windowId: string, public payload: QueryEditorState) {}
}

export type Action =
  | SetUrlAction
  | SetUrlFromDbAction
  | SetSubscriptionUrlAction
  | SendIntrospectionQueryRequestAction
  | SetQueryAction
  | SetQueryFromDbAction
  | SetQueryResultAction
  | PrettifyQueryAction
  | CompressQueryAction
  | CopyAsCurlAction
  | ConvertToNamedQueryAction
  | SendQueryRequestAction
  | SetSelectedOperationAction
  | StartSubscriptionAction
  | StopSubscriptionAction
  | SetSubscriptionClientAction
  | SetSubscriptionConnectionParamsAction
  | AddSubscriptionResponseAction
  | SetSubscriptionResponseListAction
  | SetResponseStatsAction
  | DownloadResultAction
  | CancelQueryRequestAction
  | SetHTTPMethodAction
  | SetQueryOperationsAction
  | SetQueryEditorStateAction
  ;
