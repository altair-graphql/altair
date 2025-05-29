import { GraphQLSchema } from 'graphql';
import { PerWindowState } from './per-window.interfaces';
import { RequestHandlerIds } from '../../request/types';

export interface WindowState {
  [id: string]: PerWindowState;
}

/**
 * Data structure for exported windows
 */
export interface ExportWindowState {
  version: 1;
  type: 'window';
  windowName: string;
  apiUrl: string;
  query: string;
  headers: Array<{ key: string; value: string }>;
  variables: string;
  subscriptionUrl: string;
  subscriptionConnectionParams: string | undefined;
  requestHandlerId: RequestHandlerIds | undefined;
  requestHandlerAdditionalParams: string | undefined;
  subscriptionUseDefaultRequestHandler: boolean | undefined;
  subscriptionRequestHandlerId: RequestHandlerIds | undefined;
  preRequestScript: string | undefined;
  preRequestScriptEnabled: boolean | undefined;
  postRequestScript: string | undefined;
  postRequestScriptEnabled: boolean | undefined;

  authorizationType: string | undefined;
  authorizationData: unknown | undefined;

  /**
   * ID of the collection this query belongs to
   */
  collectionId?: string;

  /**
   * ID for window in collection
   */
  windowIdInCollection?: string;
  gqlSchema?: GraphQLSchema;
}
