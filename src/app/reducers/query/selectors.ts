import { createSelector, Store } from '@ngrx/store';
import { PerWindowState } from '..';
import { initialState } from './query';

export const getQueryState = (state: PerWindowState) => state ? state.query : { ...initialState };
export const getQueryResult = createSelector(getQueryState, state => state.response);
export const getResponseStatus = createSelector(getQueryState, state => state.responseStatus);
export const getResponseTime = createSelector(getQueryState, state => state.responseTime);
export const getResponseStatusText = createSelector(getQueryState, state => state.responseStatusText);
export const isSubscribed = createSelector(getQueryState, state => state.isSubscribed);
export const getSubscriptionResponses = createSelector(getQueryState, state => state.subscriptionResponseList);
export const getSelectedOperation = createSelector(getQueryState, state => state.selectedOperation);
export const getQueryOperations = createSelector(getQueryState, state => state.operations || []);
