import { OperationDefinitionNode } from 'graphql';
import { IDictionary } from '../shared';
import { RequestHandlerIds } from '../../request/types';
import { httpVerbSchema } from './query.schema';
import { z } from 'zod/v4';

export interface QueryEditorState {
  isFocused: boolean;
  // Adding undefined for backward compatibility
  cursorIndex?: number;
}

export interface QueryResponse {
  content: string;
  timestamp: number;
  json?: boolean;
}

export interface LogLine {
  id: string;
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
  subscriptionRequestHandlerId?: RequestHandlerIds;
  isSubscribed: boolean;
  autoscrollResponseList: boolean;
  requestScriptLogs?: LogLine[];
  requestExtensions?: string;

  queryEditorState: QueryEditorState;
}

export type HttpVerb = z.infer<typeof httpVerbSchema>;
