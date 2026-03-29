import { initialQuery } from './initialQuery';

import * as query from '../../store/query/query.action';
import { getFullUrl } from '../../utils';
import { QueryState } from 'altair-graphql-core/build/types/state/query.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { AllActions } from '../action';
import {
  HTTP_HANDLER_ID,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/ids';

export const getInitialState = (): QueryState => {
  const { options } = getAltairConfig();

  return {
    url: getFullUrl(options.endpointURL ? '' + options.endpointURL : ''),
    subscriptionUrl: getFullUrl(
      options.subscriptionsEndpoint ? '' + options.subscriptionsEndpoint : '',
      options.subscriptionsProtocol
    ),
    query: options.initialQuery ? '' + options.initialQuery : initialQuery,
    selectedOperation: null,
    operations: [],
    httpVerb: options.initialHttpMethod || 'POST',
    responses: [],
    responseTime: 0,
    requestStartTime: 0,
    requestEndTime: 0,
    requestHandlerId: options.initialRequestHandlerId ?? HTTP_HANDLER_ID,
    requestHandlerAdditionalParams: JSON.stringify(
      options.initialRequestHandlerAdditionalParams ?? {},
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
    subscriptionConnectionParams: options.initialSubscriptionsPayload
      ? JSON.stringify(options.initialSubscriptionsPayload)
      : '{}',
    subscriptionRequestHandlerId:
      options.initialSubscriptionRequestHandlerId ?? WEBSOCKET_HANDLER_ID,
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
    case query.APPEND_REQUEST_SCRIPT_LOGS: {
      const existingLogIds = state.requestScriptLogs?.map((l) => l.id) ?? [];
      return {
        ...state,
        requestScriptLogs: [
          ...(state.requestScriptLogs ?? []),
          ...action.payload.filter((l) => l.id && !existingLogIds.includes(l.id)),
        ],
      };
    }
    case query.SET_REQUEST_EXTENSIONS_DATA:
      return { ...state, requestExtensions: action.payload.data };
    case query.SET_REQUEST_HANDLER_INFO:
      return {
        ...state,
        ...action.payload,
      };
    case query.SET_IS_SUBSCRIBED:
      return { ...state, isSubscribed: action.payload.isSubscribed };
    default:
      return state;
  }
}
