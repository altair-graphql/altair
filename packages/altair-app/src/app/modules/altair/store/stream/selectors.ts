import { createSelector } from '@ngrx/store';
import { PerWindowState } from '..';
import { getInitialState } from './stream.reducer';

export const getStreamState = (state: PerWindowState) => state ? state.stream : { ...getInitialState() };
export const getStreamStateString = createSelector(getStreamState, state => {
  if (state.url) {
    if (state.isConnected && state.client instanceof EventSource) {
      return 'connected';
    }
    return 'uncertain';
  }
  return '';
});
