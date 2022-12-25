import { ValueObject } from '../../utils/value-object';

export const WORKSPACES = {
  LOCAL: 'local',
  REMOTE: 'remote',
} as const;

export class WorkspaceId extends ValueObject<string> {
  constructor(props = WORKSPACES.LOCAL) {
    super(props);
  }
}
