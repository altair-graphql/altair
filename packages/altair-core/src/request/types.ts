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
  resopnseTimeMs: number;
}

export interface GraphQLRequestHandler {
  handle(request: GraphQLRequestOptions): Observable<GraphQLResponseData>;
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
