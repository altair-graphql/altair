import { z } from 'zod/v4';
import {
  ACTION_CABLE_HANDLER_ID,
  APP_SYNC_HANDLER_ID,
  GRAPHQL_SSE_HANDLER_ID,
  GRAPHQL_WS_HANDLER_ID,
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from './ids';

export const requestHandlerIdsSchema = z.enum([
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
  GRAPHQL_WS_HANDLER_ID,
  APP_SYNC_HANDLER_ID,
  ACTION_CABLE_HANDLER_ID,
  GRAPHQL_SSE_HANDLER_ID,
]);

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
export const multiResponseStrategySchema = z.enum(MultiResponseStrategy);
