import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { getInitialState } from './query.reducer';

export const getQueryState = (state: PerWindowState) => state ? state.query : { ...getInitialState() };
export const getQueryResult = createSelector(getQueryState, state => state.response);
export const getResponseStatus = createSelector(getQueryState, state => state.responseStatus);
export const getResponseTime = createSelector(getQueryState, state => state.responseTime);
export const getResponseStatusText = createSelector(getQueryState, state => state.responseStatusText);
export const getResponseHeaders = createSelector(getQueryState, state => state.responseHeaders);
export const isSubscribed = createSelector(getQueryState, state => state.isSubscribed);
export const getSubscriptionResponses = createSelector(getQueryState, state => state.subscriptionResponseList);
export const getAutoscrollSubscriptionResponse = createSelector(getQueryState, state => state.autoscrollSubscriptionResponse);
export const getSelectedOperation = createSelector(getQueryState, state => state.selectedOperation || null);
export const getQueryOperations = createSelector(getQueryState, state => state.operations || []);
