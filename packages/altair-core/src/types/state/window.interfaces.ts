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
  subscriptionConnectionParams?: string;
  requestHandlerId?: RequestHandlerIds;
  requestHandlerAdditionalParams?: string;
  subscriptionUseDefaultRequestHandler?: boolean;
  subscriptionRequestHandlerId?: RequestHandlerIds;
  preRequestScript?: string;
  preRequestScriptEnabled?: boolean;
  postRequestScript?: string;
  postRequestScriptEnabled?: boolean;

  authorizationType?: string;
  authorizationData?: any;

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
