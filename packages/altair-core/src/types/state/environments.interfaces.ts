import { IDictionary } from '../shared';

export interface InitialEnvironmentState {
  id?: string;
  title?: string;
  variables?: IDictionary;
}

export interface IInitialEnvironments {
  base?: InitialEnvironmentState;
  subEnvironments?: InitialEnvironmentState[];
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
  base: EnvironmentState;
  subEnvironments: EnvironmentState[];
  // Adding undefined for backward compatibility
  activeSubEnvironment?: string;
}
