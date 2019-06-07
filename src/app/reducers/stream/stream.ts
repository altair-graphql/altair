import * as stream from '../../actions/stream/stream';

export interface State {
  url: string;
  type: 'event' | '';
  client: EventSource;
  isConnected: boolean;
  failed: any;
}

export const initialState: State = {
  url: '',
  type: '',
  client: null,
  isConnected: false,
  failed: null
};

export function streamReducer(state = initialState, action: stream.Action): State {
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
