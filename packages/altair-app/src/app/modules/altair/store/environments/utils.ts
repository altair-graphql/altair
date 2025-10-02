import {
  ENVIRONMENT_VARIABLE_SOURCE_TYPE,
  EnvironmentsState,
  EnvironmentVariables,
  EnvironmentVariableSourceType,
  IEnvironment,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { merge } from 'lodash-es';
import { parseJson } from '../../utils';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

export const mergeEnvironments = (env1: IEnvironment, env2: IEnvironment) => {
  return merge(env1, env2);
};

type EnvironmentWithMetadata = {
  environment: IEnvironment;
  sourceType: EnvironmentVariableSourceType;
  sourceName: string;
};
/**
 * Get active environments. Most significant environment is last in the list.
 */
export const getActiveEnvironmentsList = (
  environmentsState: EnvironmentsState,
  windowCollections: IQueryCollection[] = []
): EnvironmentWithMetadata[] => {
  const baseEnvironment = parseJson(environmentsState.base.variablesJson, {});
  let subEnvironment: IEnvironment | undefined;

  if (environmentsState.activeSubEnvironment) {
    const activeSubEnvironment = environmentsState.activeSubEnvironment;
    const activeSubEnvState = environmentsState.subEnvironments.find((env) => {
      return env.id === activeSubEnvironment;
    });

    if (activeSubEnvState) {
      subEnvironment = parseJson(activeSubEnvState.variablesJson, {});
    }
  }

  return [
    {
      environment: baseEnvironment,
      sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.BASE_ENVIRONMENT,
      sourceName: 'Global Environment',
    },
    ...(subEnvironment
      ? [
          {
            environment: subEnvironment,
            sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.SUB_ENVIRONMENT,
            sourceName: 'Environment',
          },
        ]
      : []),
    ...(windowCollections
      .map((collection) => {
        if (!collection.environmentVariables) {
          return;
        }
        return {
          environment: collection.environmentVariables,
          sourceType: ENVIRONMENT_VARIABLE_SOURCE_TYPE.COLLECTION,
          sourceName: collection.title || 'Collection',
        };
      })
      .filter((env) => !!env) as EnvironmentWithMetadata[]),
  ];
};

export const getActiveEnvironment = (
  environmentsState: EnvironmentsState,
  windowCollections: IQueryCollection[] = []
) => {
  const environmentsList = getActiveEnvironmentsList(
    environmentsState,
    windowCollections
  );
  return environmentsList.reduce((acc, cur) => {
    return mergeEnvironments(acc, cur.environment);
  }, {} as IEnvironment);
};

const flattenEnvironment = (
  result: EnvironmentVariables,
  obj: IEnvironment,
  sourceType: EnvironmentVariableSourceType,
  sourceName: string,
  prefix = ''
) => {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      flattenEnvironment(
        result,
        value as IEnvironment,
        sourceType,
        sourceName,
        fullKey
      );
    } else {
      // Store the variable data
      result[fullKey] = {
        key: fullKey,
        value,
        sourceType,
        sourceName,
      };
    }
  }
};
export const environmentsToEnvironmentVariables = (
  environments: EnvironmentWithMetadata[]
): EnvironmentVariables => {
  const result: EnvironmentVariables = {};

  // Process each environment in order (later ones override earlier ones)
  for (const { environment, sourceType, sourceName } of environments) {
    flattenEnvironment(result, environment, sourceType, sourceName);
  }

  return result;
};
