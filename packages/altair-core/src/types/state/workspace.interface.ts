import { ValueObject } from '../../utils/value-object';

export const WORKSPACES = {
  LOCAL: 'local',
  REMOTE: 'remote',
};

export class WorkspaceId extends ValueObject<string> {
  constructor(props: string = WORKSPACES.LOCAL) {
    super(props);
  }
}

export interface Workspace {
  id: string;
  name: string;
  teamId?: string;
}

export interface WorkspacesState {
  list: Workspace[];
}
