import { IDictionary } from '../shared';

export interface InitialBaseEnvironmentState {
  id?: string;
  title?: string;
  variables?: IDictionary;
}
export interface InitialEnvironmentState {
  id?: string;
  title?: string;
  variables?: IDictionary;
}

export interface IInitialEnvironments {
  activeSubEnvironment?: string;
  base?: InitialBaseEnvironmentState;
  subEnvironments?: InitialEnvironmentState[];
}

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
