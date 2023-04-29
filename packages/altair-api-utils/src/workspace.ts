import { QueryCollection, Workspace } from '@altairgraphql/db';

export interface ICreateWorkspaceDto {
  name: string;
  teamId?: string;
}

export type IUpdateWorkspaceDto = Partial<ICreateWorkspaceDto>;

export type ReturnedWorkspace = Workspace;
