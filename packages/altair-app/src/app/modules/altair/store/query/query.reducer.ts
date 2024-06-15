import { initialQuery } from './initialQuery';

import * as query from '../../store/query/query.action';
import { getFullUrl } from '../../utils';
import { QueryState } from 'altair-graphql-core/build/types/state/query.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { AllActions } from '../action';
import {
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';

export const getInitialState = (): QueryState => {
  const { initialData } = getAltairConfig();

  return {
    url: getFullUrl(initialData.url ? '' + initialData.url : ''),
    subscriptionUrl: getFullUrl(
      initialData.subscriptionsEndpoint
        ? '' + initialData.subscriptionsEndpoint
        : '',
      initialData.subscriptionsProtocol
    ),
    query: initialData.query ? '' + initialData.query : initialQuery,
    selectedOperation: null,
    operations: [],
    httpVerb: initialData.initialHttpMethod || 'POST',
    responses: [],
    responseTime: 0,
    requestStartTime: 0,
    requestEndTime: 0,
    requestHandlerId: initialData.initialRequestHandlerId ?? HTTP_HANDLER_ID,
    requestHandlerAdditionalParams: JSON.stringify(
      initialData.initialRequestHandlerAdditionalParams ?? {},
      null,
      2
    ),
    subscriptionUseDefaultRequestHandler: false,
    responseStatus: 0,
    responseStatusText: '',
    responseHeaders: {},
    showUrlAlert: false,
    urlAlertMessage: 'URL has been set',
    urlAlertSuccess: true,
    showEditorAlert: false,
    editorAlertMessage: 'Query is set',
    editorAlertSuccess: true,
    subscriptionConnectionParams: initialData.initialSubscriptionsPayload
      ? JSON.stringify(initialData.initialSubscriptionsPayload)
      : '{}',
    subscriptionProviderId:
      initialData.initialSubscriptionRequestHandlerId ?? WEBSOCKET_HANDLER_ID,
    isSubscribed: false,
    autoscrollResponseList: false,
    queryEditorState: {
      isFocused: false,
    },
    requestScriptLogs: [],
    requestExtensions: '',
  };
};

export function queryReducer(
  state = getInitialState(),
  action: AllActions
): QueryState {
  switch (action.type) {
    case query.SET_QUERY:
    case query.SET_QUERY_FROM_DB:
      return {
        ...state,
        query: action.payload || '',
      };
    case query.SET_URL:
    case query.SET_URL_FROM_DB:
      return { ...state, url: action.payload.url };
    case query.SET_SUBSCRIPTION_URL:
      return { ...state, subscriptionUrl: action.payload.subscriptionUrl };
    case query.SET_QUERY_RESPONSES:
      return { ...state, responses: action.payload.responses };
    case query.ADD_QUERY_RESPONSES:
      return {
        ...state,
        responses: [...(state.responses ?? []), ...action.payload.responses],
      };
    case query.SET_QUERY_RESULT_RESPONSE_HEADERS:
      return { ...state, responseHeaders: action.payload.headers };
    case query.SET_SELECTED_OPERATION:
      return { ...state, selectedOperation: action.payload.selectedOperation };
    case query.SET_RESPONSE_STATS:
      return {
        ...state,
        requestStartTime: action.payload.requestStartTime,
        requestEndTime: action.payload.requestEndTime,
        responseTime: action.payload.responseTime,
        responseStatus: action.payload.responseStatus,
        responseStatusText: action.payload.responseStatusText,
      };
    case query.SET_SUBSCRIPTION_CONNECTION_PARAMS:
      return {
        ...state,
        subscriptionConnectionParams: action.payload.connectionParams,
      };
    case query.SET_SUBSCRIPTION_REQUEST_HANDLER_ID:
      return { ...state, subscriptionRequestHandlerId: action.payload.handlerId };
    case query.TOGGLE_AUTOSCROLL_RESPONSE_LIST:
      return {
        ...state,
        autoscrollResponseList: !state.autoscrollResponseList,
      };
    case query.SET_HTTP_VERB:
      return { ...state, httpVerb: action.payload.httpVerb };
    case query.SET_QUERY_OPERATIONS:
      return { ...state, operations: action.payload.operations };
    case query.SET_QUERY_EDITOR_STATE:
      return { ...state, queryEditorState: action.payload };
    case query.SET_REQUEST_SCRIPT_LOGS:
      return { ...state, requestScriptLogs: action.payload };
    case query.APPEND_REQUEST_SCRIPT_LOGS:
      return {
        ...state,
        requestScriptLogs: [...(state.requestScriptLogs ?? []), ...action.payload],
      };
    case query.SET_REQUEST_EXTENSIONS_DATA:
      return { ...state, requestExtensions: action.payload.data };
    case query.SET_REQUEST_HANDLER_INFO:
      return {
        ...state,
        requestHandlerId: action.payload.requestHandlerId,
        requestHandlerAdditionalParams: action.payload.additionalParams,
        subscriptionUseDefaultRequestHandler:
          action.payload.subscriptionUseDefaultRequestHandler,
        subscriptionUrl: action.payload.subscriptionUrl ?? '',
        subscriptionConnectionParams:
          action.payload.subscriptionConnectionParams ?? '',
        subscriptionRequestHandlerId: action.payload.subscriptionRequestHandlerId,
      };
    case query.SET_IS_SUBSCRIBED:
      return { ...state, isSubscribed: action.payload.isSubscribed };
    default:
      return state;
  }
}
