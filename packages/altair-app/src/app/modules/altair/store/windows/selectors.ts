import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { str } from '../../utils';
import { getWindowCollection } from '../collection/utils';

export const selectActiveWindowState = (state: RootState) => {
  return state.windows[state.windowsMeta.activeWindowId];
};
export const selectWindowState = (windowId: string) => (state: RootState) => {
  return state.windows[windowId];
};

export const windowHasUnsavedChanges = (
  windowState?: PerWindowState,
  collections?: IQueryCollection[]
) => {
  if (!windowState || !collections?.length) {
    return false;
  }
  const collection = getWindowCollection(windowState, collections);
  if (!collection) {
    return false;
  }
  const queryInCollection = collection?.queries.find(
    (q) => str(q.id) === str(windowState.layout.windowIdInCollection ?? '')
  );

  return (
    queryInCollection?.query !== windowState.query.query ||
    queryInCollection?.variables !== windowState.variables.variables
  );
};
