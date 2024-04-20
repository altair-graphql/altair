import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';

export const selectWindowState = (windowId: string) => (state: RootState) => {
  return state.windows[windowId];
};
