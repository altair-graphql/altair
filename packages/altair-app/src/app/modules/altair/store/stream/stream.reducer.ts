import { StreamState } from 'altair-graphql-core/build/types/state/stream.interfaces';
import * as stream from './stream.action';


export const getInitialState = (): StreamState => {
  return {
    url: '',
    type: '',
    isConnected: false,
    failed: null
  };
};

export function streamReducer(state = getInitialState(), action: stream.Action): StreamState {
  switch (action.type) {
    case stream.SET_STREAM_SETTING:
      return { ...state, url: action.payload.streamUrl, isConnected: false };
    case stream.SET_STREAM_CLIENT:
      return { ...state, client: action.payload.streamClient };
    case stream.SET_STREAM_FAILED:
      return { ...state, failed: action.payload.failed, isConnected: false };
    case stream.SET_STREAM_CONNECTED:
      return { ...state, isConnected: action.payload.connected };
    default:
      return state;
  }
}
