import * as preRequest from '../../actions/pre-request/pre-request';
import config from 'app/config';

export interface State {
  enabled: boolean;
  script: string;
}

export const initialState: State = {
  enabled: !!config.initialData.preRequestScript,
  script: config.initialData.preRequestScript ? '' + config.initialData.preRequestScript : '',
};

export function preRequestReducer(state = initialState, action: preRequest.Action): State {
  switch (action.type) {
    case preRequest.SET_PREREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case preRequest.SET_PREREQIEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
