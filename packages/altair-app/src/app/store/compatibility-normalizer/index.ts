import * as fromWindows from '../windows/windows.reducer';

export function normalize(state: fromWindows.State) {
  return Object.keys(state).map(windowId => {
    const windowState = state[windowId];

    windowState.headers = windowState.headers.map(header => {
      return {
          ...header,
          enabled: header.enabled !== undefined ? header.enabled : true
      }
    });

    return windowState;
  }).reduce((newState, windowState) => {
    newState[windowState.windowId] = windowState;

    return newState;
  }, {} as fromWindows.State);
}
