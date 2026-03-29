import {
  AuthorizationState,
  DEFAULT_AUTHORIZATION_TYPE,
} from 'altair-graphql-core/build/types/state/authorization.interface';
import { getAltairConfig } from 'altair-graphql-core/build/config';

import * as authorization from '../../store/authorization/authorization.action';
import { AllActions } from '../action';

export const getInitialState = (): AuthorizationState => {
  const altairConfig = getAltairConfig();
  return {
    data: altairConfig.options.initialAuthorization?.data ?? undefined,
    result: {
      headers: {},
    },
    type:
      altairConfig.options.initialAuthorization?.type ?? DEFAULT_AUTHORIZATION_TYPE,
  };
};

export function authorizationReducer(
  state = getInitialState(),
  action: AllActions
): AuthorizationState {
  switch (action.type) {
    case authorization.SELECT_AUTHORIZATION_TYPE: {
      const payload = action.payload;
      return {
        ...state,
        type: payload.type,
      };
    }
    case authorization.UPDATE_AUTHORIZATION_DATA: {
      const payload = action.payload;
      return {
        ...state,
        data: payload.data,
      };
    }
    default:
      return state;
  }
}
