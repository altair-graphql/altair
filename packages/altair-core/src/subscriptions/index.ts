import { SubscriptionProviderConstructor } from './subscription-provider';

export const WEBSOCKET_PROVIDER_ID = 'websocket';
export const GRAPHQL_WS_PROVIDER_ID = 'graphql-ws';
export const APP_SYNC_PROVIDER_ID = 'app-sync';
export const ACTION_CABLE_PROVIDER_ID = 'action-cable';
export const GRAPHQL_SSE_ID = 'graphql-sse';

export const SUBSCRIPTION_PROVIDER_IDS = {
  WEBSOCKET: WEBSOCKET_PROVIDER_ID,
  GRAPHQL_WS: GRAPHQL_WS_PROVIDER_ID,
  APP_SYNC: APP_SYNC_PROVIDER_ID,
  ACTION_CABLE: ACTION_CABLE_PROVIDER_ID,
  GRAPHQL_SSE: GRAPHQL_SSE_ID,
} as const;

export type SubscriptionProviderIds =
  (typeof SUBSCRIPTION_PROVIDER_IDS)[keyof typeof SUBSCRIPTION_PROVIDER_IDS];

export interface SubscriptionProviderData {
  /**
   * Unique identifier for the provider
   */
  id: string;

  /**
   * Function that returns a promise that resolves with the provider class (NOT an instance of the class)
   */
  getProviderClass: () => Promise<SubscriptionProviderConstructor>;

  /**
   * The text to be shown for this provider in the Altair UI
   */
  copyTag?: string;
}
