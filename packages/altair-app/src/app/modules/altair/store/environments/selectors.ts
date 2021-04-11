import { createSelector } from '@ngrx/store';
import * as fromRoot from '..';
import { getInitialState } from './environments.reducer';

export const getEnvironments = (state: fromRoot.State) => state ? state.environments : { ...getInitialState() };
export const getActiveSubEnvironmentState = createSelector(getEnvironments, (state) => {
  if (state.activeSubEnvironment) {
    const activeSubEnvState = state.subEnvironments.find(env => {
      return env.id === state.activeSubEnvironment;
    });

    return activeSubEnvState;
  }
});
