import { getAltairConfig } from 'altair-graphql-core/build/config';
import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import * as postRequest from '../post-request/post-request.action';


export const getInitialState = (): PostrequestState => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.initialData.postRequestScript,
    script: altairConfig.initialData.postRequestScript ? '' + altairConfig.initialData.postRequestScript : '',
  }
};

export function postRequestReducer(state = getInitialState(), action: postRequest.Action): PostrequestState {
  switch (action.type) {
    case postRequest.SET_POSTREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case postRequest.SET_POSTREQUEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
