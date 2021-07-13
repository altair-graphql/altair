import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getInitialState } from './environments.reducer';

export const getEnvironments = (state: RootState) => state ? state.environments : { ...getInitialState() };
export const getActiveSubEnvironmentState = createSelector(getEnvironments, (state) => {
  if (state.activeSubEnvironment) {
    const activeSubEnvState = state.subEnvironments.find(env => {
      return env.id === state.activeSubEnvironment;
    });

    return activeSubEnvState;
  }
});
