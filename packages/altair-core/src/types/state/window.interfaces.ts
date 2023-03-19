import { GraphQLSchema } from 'graphql';
import { SubscriptionProviderIds } from '../../subscriptions';
import { PerWindowState } from './per-window.interfaces';

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
  subscriptionProvider?: SubscriptionProviderIds;
  preRequestScript?: string;
  preRequestScriptEnabled?: boolean;
  postRequestScript?: string;
  postRequestScriptEnabled?: boolean;

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
