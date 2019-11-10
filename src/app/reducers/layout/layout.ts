import { Action } from '@ngrx/store';

import * as layout from '../../actions/layout/layout';

export interface State {
  isLoading: boolean;
  title: string;
  collectionId?: number;
  windowIdInCollection?: string;
}

export const initialState: State = {
  isLoading: false,
  title: 'New window',
};

export function layoutReducer(state = initialState, action: layout.Action): State {
  switch (action.type) {
    case layout.START_LOADING:
      return { ...state, isLoading: true };
    case layout.STOP_LOADING:
      return { ...state, isLoading: false };
    case layout.SET_WINDOW_NAME:
      return { ...state, title: action.payload };
    default:
      return state;
  }
}
