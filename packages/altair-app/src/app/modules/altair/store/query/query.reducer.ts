import { initialQuery } from './initialQuery';

import * as query from '../../store/query/query.action';
import { getFullUrl } from '../../utils';
import { QueryState } from 'altair-graphql-core/build/types/state/query.interfaces';
import { getAltairConfig } from 'altair-graphql-core/build/config';
import { WEBSOCKET_PROVIDER_ID } from 'altair-graphql-core/build/subscriptions';

export const getInitialState = (): QueryState => {
  const { initialData } = getAltairConfig();

  return {
    url: getFullUrl(initialData.url ? '' + initialData.url : ''),
    subscriptionUrl: initialData.subscriptionsEndpoint ? '' + initialData.subscriptionsEndpoint : '',
    query: initialData.query ? '' + initialData.query : initialQuery,
    selectedOperation: null,
    operations: [],
    httpVerb : initialData.initialHttpMethod || 'POST',
    response: null,
    responseTime: 0,
    requestStartTime: 0,
    requestEndTime: 0,
    responseStatus: 0,
    responseStatusText: '',
    responseHeaders: {},
    showUrlAlert: false,
    urlAlertMessage: 'URL has been set',
    urlAlertSuccess: true,
    showEditorAlert: false,
    editorAlertMessage: 'Query is set',
    editorAlertSuccess: true,
    subscriptionClient: null,
    subscriptionConnectionParams: initialData.initialSubscriptionsPayload ? JSON.stringify(initialData.initialSubscriptionsPayload) : '{}',
    subscriptionProviderId: initialData.initialSubscriptionsProvider || WEBSOCKET_PROVIDER_ID,
    isSubscribed: false,
    subscriptionResponseList: [],
    autoscrollSubscriptionResponse: false,
    queryEditorState: {
      isFocused: false,
    },
  }
};

export function queryReducer(state = getInitialState(), action: query.Action): QueryState {
  switch (action.type) {
    case query.SET_QUERY:
    case query.SET_QUERY_FROM_DB:
      return Object.assign({}, state, { query: action.payload || '' });
    case query.SET_URL:
    case query.SET_URL_FROM_DB:
      return Object.assign({}, state, { url: action.payload.url });
    case query.SET_SUBSCRIPTION_URL:
      return Object.assign({}, state, { subscriptionUrl: action.payload.subscriptionUrl });
    case query.SET_QUERY_RESULT:
      return Object.assign({}, state, { response: action.payload });
    case query.SET_QUERY_RESULT_RESPONSE_HEADERS:
      return { ...state, responseHeaders: action.payload.headers };
    case query.SET_SELECTED_OPERATION:
      return Object.assign({}, state, { selectedOperation: action.payload.selectedOperation });
    case query.SET_RESPONSE_STATS:
      return Object.assign({}, state, {
        requestStartTime: action.payload.requestStartTime,
        requestEndTime: action.payload.requestEndTime,
        responseTime: action.payload.responseTime,
        responseStatus: action.payload.responseStatus,
        responseStatusText: action.payload.responseStatusText
      });
    case query.START_SUBSCRIPTION:
      return Object.assign({}, state, { isSubscribed: true });
    case query.STOP_SUBSCRIPTION:
      return Object.assign({}, state, { isSubscribed: false });
    case query.SET_SUBSCRIPTION_CONNECTION_PARAMS:
      return { ...state, subscriptionConnectionParams: action.payload.connectionParams };
    case query.SET_SUBSCRIPTION_PROVIDER_ID:
      return { ...state, subscriptionProviderId: action.payload.providerId };
    case query.SET_SUBSCRIPTION_CLIENT:
      return Object.assign({}, state, { subscriptionClient: action.payload.subscriptionClient });
    case query.ADD_SUBSCRIPTION_RESPONSE:
      return Object.assign({}, state, {
        subscriptionResponseList: [...state.subscriptionResponseList, {
          response: action.payload.response,
          responseTime: action.payload.responseTime,
          responseObj: action.payload.responseObj,
        }]
      });
    case query.SET_SUBSCRIPTION_RESPONSE_LIST:
      return Object.assign({}, state, { subscriptionResponseList: action.payload.list });
    case query.TOGGLE_AUTOSCROLL_SUBSCRIPTION_RESPONSE:
      return { ...state, autoscrollSubscriptionResponse: !state.autoscrollSubscriptionResponse };
    case query.SET_HTTP_VERB:
      return Object.assign({}, state, { httpVerb: action.payload.httpVerb });
    case query.SET_QUERY_OPERATIONS:
      return Object.assign({}, state, { operations: action.payload.operations });
    case query.SET_QUERY_EDITOR_STATE:
      return { ...state, queryEditorState: action.payload };
    default:
      return state;
  }
}
