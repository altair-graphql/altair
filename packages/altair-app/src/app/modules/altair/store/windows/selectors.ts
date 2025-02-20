import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { str } from '../../utils';

export const selectWindowState = (windowId: string) => (state: RootState) => {
  return state.windows[windowId];
};

export const windowHasUnsavedChanges = (
  windowState?: PerWindowState,
  collections?: IQueryCollection[]
) => {
  if (!windowState || !collections) {
    return false;
  }
  const collection = collections.find(
    (c) => str(c.id) === str(windowState.layout.collectionId)
  );
  const queryInCollection = collection?.queries.find(
    (q) => str(q.id) === str(windowState.layout.windowIdInCollection ?? '')
  );

  return (
    queryInCollection?.query !== windowState.query.query ||
    queryInCollection?.variables !== windowState.variables.variables
  );
};
