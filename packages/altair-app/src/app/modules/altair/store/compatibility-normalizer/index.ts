import { WindowState } from 'altair-graphql-core/build/types/state/window.interfaces';

export function normalize(state: WindowState) {
  return Object.keys(state).map(windowId => {
    const windowState = state[windowId];

    if (windowState.headers) {
      windowState.headers = windowState.headers.map(header => {
        return {
            ...header,
            enabled: header.enabled !== undefined ? header.enabled : true
        }
      });
    }

    return windowState;
  }).reduce((newState, windowState) => {
    newState[windowState.windowId] = windowState;

    return newState;
  }, {} as WindowState);
}
