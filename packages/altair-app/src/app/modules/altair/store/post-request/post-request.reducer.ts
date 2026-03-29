import { getAltairConfig } from 'altair-graphql-core/build/config';
import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { AllActions } from '../action';
import * as postRequest from '../post-request/post-request.action';

export const getInitialState = (): PostrequestState => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.options.initialPostRequestScript,
    script: altairConfig.options.initialPostRequestScript
      ? '' + altairConfig.options.initialPostRequestScript
      : '',
  };
};

export function postRequestReducer(
  state = getInitialState(),
  action: AllActions
): PostrequestState {
  switch (action.type) {
    case postRequest.SET_POSTREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case postRequest.SET_POSTREQUEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
