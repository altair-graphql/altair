import { output } from 'zod/v4';
import { IDictionary } from '../shared';
import {
  initialEnvironmentSchema,
  initialEnvironmentsSchema,
} from './environments.schema';

export type InitialEnvironmentState = output<typeof initialEnvironmentSchema>;

export type IInitialEnvironments = output<typeof initialEnvironmentsSchema>;

export interface BaseEnvironmentState {
  // Adding undefined for backward compatibility
  id?: string;
  variablesJson: string;
}
export interface EnvironmentState {
  // Adding undefined for backward compatibility
  id?: string;
  title: string;
  variablesJson: string;
}
export interface ExportEnvironmentState extends InitialEnvironmentState {
  version: 1;
  type: 'environment';
}

export interface EnvironmentsState {
  base: BaseEnvironmentState;
  subEnvironments: EnvironmentState[];
  // Adding undefined for backward compatibility
  activeSubEnvironment?: string;
}

export interface IEnvironment extends IDictionary {
  headers?: IDictionary<string>;
  accentColor?: string;
}

export const ENVIRONMENT_VARIABLE_SOURCE_TYPE = {
  /**
   * Base environment
   */
  BASE_ENVIRONMENT: 'base',
  /**
   * Sub environment
   */
  SUB_ENVIRONMENT: 'sub',
  /**
   * Collection environment
   */
  COLLECTION: 'collection',
} as const;
export type EnvironmentVariableSourceType =
  (typeof ENVIRONMENT_VARIABLE_SOURCE_TYPE)[keyof typeof ENVIRONMENT_VARIABLE_SOURCE_TYPE];

export interface EnvironmentVariableData {
  key: string;
  value: unknown;
  /**
   * The source type of the environment variable
   */
  sourceType: EnvironmentVariableSourceType;
  /**
   * The name of the source, for display purposes
   */
  sourceName: string;
}

export type EnvironmentVariables = Record<string, EnvironmentVariableData>;
