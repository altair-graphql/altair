export interface ICreateWorkspaceDto {
  name: string;
  teamId?: string;
}

export type IUpdateWorkspaceDto = Partial<ICreateWorkspaceDto>;
