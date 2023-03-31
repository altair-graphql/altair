import { TeamMemberRole } from '@altairgraphql/db';

export interface ICreateTeamDto {
  name: string;
  description?: string;
}

export type IUpdateTeamDto = Partial<ICreateTeamDto>;

export interface ICreateTeamMembershipDto {
  email: string;
  teamId: string;
  role?: TeamMemberRole;
}

export type IUpdateTeamMembershipDto = Partial<ICreateTeamMembershipDto>;
