import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getInitialState } from './environments.reducer';
import { getActiveEnvironment, getActiveEnvironmentsList } from './utils';
import { selectWindowParentCollections } from '../collection/selectors';

export const getEnvironments = (state: RootState) =>
  state ? state.environments : { ...getInitialState() };
export const getActiveSubEnvironmentState = createSelector(
  getEnvironments,
  (state) => {
    if (state.activeSubEnvironment) {
      const activeSubEnvState = state.subEnvironments.find((env) => {
        return env.id === state.activeSubEnvironment;
      });

      return activeSubEnvState;
    }
  }
);

export const selectActiveEnvironmentsList = (windowId: string) =>
  createSelector(
    getEnvironments,
    selectWindowParentCollections(windowId),
    (state, windowCollections) => getActiveEnvironmentsList(state, windowCollections)
  );

export const selectActiveEnvironment = (windowId?: string) =>
  createSelector(
    getEnvironments,
    selectWindowParentCollections(windowId),
    (state, windowCollections) => getActiveEnvironment(state, windowCollections)
  );

export const selectEnvironmentAccentColor = createSelector(
  selectActiveEnvironment(),
  (state) => state.accentColor
);
