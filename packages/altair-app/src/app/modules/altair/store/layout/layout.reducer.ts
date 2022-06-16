import { Action } from '@ngrx/store';
import { LayoutState } from 'altair-graphql-core/build/types/state/layout.interfaces';

import * as layout from '../../store/layout/layout.action';

export const getInitialState = (): LayoutState => {
  return {
    isLoading: false,
    title: 'New window',
    hasDynamicTitle: true,
  };
};

export function layoutReducer(
  state = getInitialState(),
  action: layout.Action
): LayoutState {
  switch (action.type) {
    case layout.START_LOADING:
      return { ...state, isLoading: true };
    case layout.STOP_LOADING:
      return { ...state, isLoading: false };
    case layout.SET_WINDOW_NAME:
      return {
        ...state,
        title: action.payload.title,
        hasDynamicTitle: !action.payload.setByUser,
      };
    case layout.SET_WINDOW_ID_IN_COLLECTION:
      return {
        ...state,
        windowIdInCollection: action.payload.windowIdInCollection,
        collectionId: action.payload.collectionId,
      };
    default:
      return state;
  }
}
