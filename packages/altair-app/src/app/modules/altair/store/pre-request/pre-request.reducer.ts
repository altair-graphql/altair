import { getAltairConfig } from 'altair-graphql-core/build/config';
import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import * as preRequest from '../../store/pre-request/pre-request.action';


export const getInitialState = (): PrerequestState => {
  const altairConfig = getAltairConfig();
  return {
    enabled: !!altairConfig.initialData.preRequestScript,
    script: altairConfig.initialData.preRequestScript ? '' + altairConfig.initialData.preRequestScript : '',
  }
};

export function preRequestReducer(state = getInitialState(), action: preRequest.Action): PrerequestState {
  switch (action.type) {
    case preRequest.SET_PREREQUEST_SCRIPT:
      return { ...state, script: action.payload.script };
    case preRequest.SET_PREREQUEST_ENABLED:
      return { ...state, enabled: action.payload.enabled };
    default:
      return state;
  }
}
