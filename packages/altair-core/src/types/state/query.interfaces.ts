import { OperationDefinitionNode } from 'graphql';
import { SubscriptionProvider } from '../../subscriptions/subscription-provider';
import { IDictionary } from '../shared';
import { RequestHandlerIds } from '../../request/types';

export interface QueryEditorState {
  isFocused: boolean;
  // Adding undefined for backward compatibility
  cursorIndex?: number;
}

export interface QueryResponse {
  content: string;
  timestamp: number;
}

export interface SubscriptionResponse {
  response: string;
  responseObj: unknown;
  responseTime: number;
}

export interface LogLine {
  time: number;
  text: string;
  source: string;
}

export type SelectedOperation = string | null;

export interface RequestHandlerInfo {
  requestHandlerId?: RequestHandlerIds;
  additionalParams?: string;
  subscriptionUseDefaultRequestHandler?: boolean;
  subscriptionUrl?: string;
  subscriptionConnectionParams?: string;
  subscriptionRequestHandlerId?: RequestHandlerIds;
}
export interface QueryState {
  url: string;
  subscriptionUrl: string;
  // Adding undefined for backward compatibility
  query?: string;
  // Adding undefined for backward compatibility
  selectedOperation?: SelectedOperation;
  // Adding undefined for backward compatibility
  operations?: OperationDefinitionNode[];
  httpVerb: HttpVerb;
  responses?: QueryResponse[];
  requestStartTime: number;
  requestEndTime: number;
  requestHandlerId?: RequestHandlerIds;
  requestHandlerAdditionalParams?: string;
  subscriptionUseDefaultRequestHandler?: boolean;
  responseTime: number;
  responseStatus: number;
  responseStatusText: string;
  responseHeaders?: IDictionary;
  showUrlAlert: boolean;
  urlAlertMessage: string;
  urlAlertSuccess: boolean;
  showEditorAlert: boolean;
  editorAlertMessage: string;
  editorAlertSuccess: boolean;
  subscriptionConnectionParams: string;

  /**
   * @deprecated Use {@link subscriptionRequestHandlerId} instead. Will be removed in future versions.
   */
  subscriptionProviderId?: string;
  subscriptionRequestHandlerId?: RequestHandlerIds;
  isSubscribed: boolean;
  autoscrollResponseList: boolean;
  requestScriptLogs?: LogLine[];
  requestExtensions?: string;

  queryEditorState: QueryEditorState;
}

export const HTTP_VERBS = ['POST', 'GET', 'PUT', 'DELETE'] as const;
export type HttpVerb = (typeof HTTP_VERBS)[number];
