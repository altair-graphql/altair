import * as preRequest from '../../actions/pre-request/pre-request';
import { getAltairConfig } from 'app/config';

export interface State {
  enabled: boolean;
  script: string;
}

export const getInitialState = (): State => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.initialData.preRequestScript,
    script: altairConfig.initialData.preRequestScript ? '' + altairConfig.initialData.preRequestScript : '',
  }
};

export function preRequestReducer(state = getInitialState(), action: preRequest.Action): State {
  switch (action.type) {
    case preRequest.SET_PREREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case preRequest.SET_PREREQIEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
