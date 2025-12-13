import { Observable } from 'rxjs';
import { HeaderState } from '../types/state/header.interfaces';
import { SelectedOperation } from '../types/state/query.interfaces';

interface ResolvedFileVariable {
  name: string;
  data: File;
}
export interface GraphQLRequestOptions {
  url: string;
  query: string;
  method: string;
  withCredentials?: boolean;
  variables?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
  headers?: HeaderState;
  files?: ResolvedFileVariable[];
  selectedOperation?: SelectedOperation;
  batchedRequest?: boolean;
  additionalParams?: Record<string, unknown>;
}
export interface GraphQLResponseData {
  ok: boolean;
  data: string;
  headers: Headers;
  status: number;
  statusText: string;
  url: string;

  /**
   * The timestamp when the request was started
   */
  requestStartTimestamp: number;

  /**
   * The timestamp when the request was ended
   */
  requestEndTimestamp: number;

  /**
   * The time taken to get the response in milliseconds
   */
  responseTimeMs: number;
}

export interface GraphQLRequestHandler {
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData>;
  generateCurl?(request: GraphQLRequestOptions): string;
  destroy?(): void;
}

export enum MultiResponseStrategy {
  /**
   * Automatically determine the strategy based on the response
   */
  AUTO = 'auto',

  /**
   * Concatenate all responses
   */
  CONCATENATE = 'concatenate',

  /**
   * Append responses as a list
   */
  APPEND = 'append',

  /**
   * Patch the responses together following the GraphQL spec
   */
  PATCH = 'patch',
}

export const HTTP_HANDLER_ID = 'http';
export const WEBSOCKET_HANDLER_ID = 'websocket';
export const GRAPHQL_WS_HANDLER_ID = 'graphql-ws';
export const APP_SYNC_HANDLER_ID = 'app-sync';
export const ACTION_CABLE_HANDLER_ID = 'action-cable';
export const GRAPHQL_SSE_HANDLER_ID = 'graphql-sse';

export const REQUEST_HANDLER_IDS = {
  HTTP: HTTP_HANDLER_ID,
  WEBSOCKET: WEBSOCKET_HANDLER_ID,
  GRAPHQL_WS: GRAPHQL_WS_HANDLER_ID,
  APP_SYNC: APP_SYNC_HANDLER_ID,
  ACTION_CABLE: ACTION_CABLE_HANDLER_ID,
  GRAPHQL_SSE: GRAPHQL_SSE_HANDLER_ID,
} as const;

export type RequestHandlerIds =
  (typeof REQUEST_HANDLER_IDS)[keyof typeof REQUEST_HANDLER_IDS];

export interface RequestHandlerData {
  /**
   * Unique identifier for the handler
   */
  id: string;

  /**
   * Function that returns a promise that resolves with the handler class (NOT an instance of the class)
   */
  getHandler: () => Promise<GraphQLRequestHandler>;

  /**
   * The text to be shown for this handler in the Altair UI
   */
  copyTag?: string;
}
