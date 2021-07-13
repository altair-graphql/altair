import { IDictionary } from '../shared';

interface InitialEnvironmentState {
  id?: string
  title?: string,
  variables?: IDictionary,
};

export interface IInitialEnvironments {
  base?: InitialEnvironmentState,
  subEnvironments?: InitialEnvironmentState[]
}

export interface EnvironmentState {
  // Adding undefined for backward compatibility
  id?: string;
  title: string;
  variablesJson: string;
}

export interface EnvironmentsState {
  base: EnvironmentState;
  subEnvironments: EnvironmentState[];
  // Adding undefined for backward compatibility
  activeSubEnvironment?: string;
}
