import { IDictionary } from '../shared';

export interface QueryEditorState {
  isFocused: boolean;
  // Adding undefined for backward compatibility
  cursorIndex?: number;
}

export interface SubscriptionResponse {
  response: string;
  responseObj: any;
  responseTime: number;
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
  operations?: any[];
  httpVerb: HttpVerb;
  response: any;
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
  subscriptionClient: any;
  subscriptionConnectionParams: string;
  subscriptionProviderId?: string;
  isSubscribed: boolean;
  subscriptionResponseList: SubscriptionResponse[];
  autoscrollSubscriptionResponse: boolean;

  queryEditorState: QueryEditorState;
}

export const HTTP_VERBS = ['POST', 'GET', 'PUT', 'DELETE'] as const;
export type HttpVerb = typeof HTTP_VERBS[number];
