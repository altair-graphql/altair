import { OperationDefinitionNode } from 'graphql';
import { SubscriptionProvider } from '../../subscriptions/subscription-provider';
import { IDictionary } from '../shared';

export interface QueryEditorState {
  isFocused: boolean;
  // Adding undefined for backward compatibility
  cursorIndex?: number;
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
  response?: string;
  requestStartTime: number;
  requestEndTime: number;
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
  subscriptionClient?: SubscriptionProvider;
  subscriptionConnectionParams: string;
  subscriptionProviderId?: string;
  isSubscribed: boolean;
  subscriptionResponseList: SubscriptionResponse[];
  autoscrollSubscriptionResponse: boolean;
  requestScriptLogs?: LogLine[];
  requestExtensions?: string;

  queryEditorState: QueryEditorState;
}

export const HTTP_VERBS = ['POST', 'GET', 'PUT', 'DELETE'] as const;
export type HttpVerb = (typeof HTTP_VERBS)[number];
