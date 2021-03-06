import * as postRequest from '../post-request/post-request.action';
import { getAltairConfig } from 'app/config';

export interface State {
  enabled: boolean;
  script: string;
}

export const getInitialState = (): State => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.initialData.postRequestScript,
    script: altairConfig.initialData.postRequestScript ? '' + altairConfig.initialData.postRequestScript : '',
  }
};

export function postRequestReducer(state = getInitialState(), action: postRequest.Action): State {
  switch (action.type) {
    case postRequest.SET_POSTREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case postRequest.SET_POSTREQUEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
