import { getAltairConfig } from 'altair-graphql-core/build/config';
import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import * as preRequest from '../../store/pre-request/pre-request.action';
import { AllActions } from '../action';

export const getInitialState = (): PrerequestState => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.options.initialPreRequestScript,
    script: altairConfig.options.initialPreRequestScript
      ? '' + altairConfig.options.initialPreRequestScript
      : '',
  };
};

export function preRequestReducer(
  state = getInitialState(),
  action: AllActions
): PrerequestState {
  switch (action.type) {
    case preRequest.SET_PREREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case preRequest.SET_PREREQUEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
