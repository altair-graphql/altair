import {
  EnvironmentsState,
  IEnvironment,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { merge } from 'lodash-es';

export const mergeEnvironments = (env1: IEnvironment, env2: IEnvironment) => {
  return merge(env1, env2);
};

export const getActiveEnvironment = (environmentsState: EnvironmentsState) => {
  let baseEnvironment = {};
  let subEnvironment = {};
  try {
    baseEnvironment = JSON.parse(environmentsState.base.variablesJson);
  } catch (ex) {
    //
  }

  if (environmentsState.activeSubEnvironment) {
    const activeSubEnvironment = environmentsState.activeSubEnvironment;
    const activeSubEnvState = environmentsState.subEnvironments.find((env) => {
      return env.id === activeSubEnvironment;
    });

    if (activeSubEnvState) {
      try {
        subEnvironment = JSON.parse(activeSubEnvState.variablesJson);
      } catch (ex) {
        //
      }
    }
  }

  return mergeEnvironments(baseEnvironment, subEnvironment);
};
