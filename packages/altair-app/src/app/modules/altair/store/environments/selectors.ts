import { createSelector } from '@ngrx/store';
import { RootState } from 'altair-graphql-core/build/types/state/state.interfaces';
import { getInitialState } from './environments.reducer';
import { getActiveEnvironment } from '../../services/environment/helpers';

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
export const selectActiveEnvironment = createSelector(getEnvironments, (state) =>
  getActiveEnvironment(state)
);

export const getEnvironmentAccentColor = createSelector(
  selectActiveEnvironment,
  (state) => state.accentColor
);
