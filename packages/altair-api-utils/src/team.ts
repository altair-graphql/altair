import { TeamMemberRole } from '@prisma/client';

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export type UpdateTeamDto = Partial<CreateTeamDto>;

export interface CreateTeamMembershipDto {
  email: string;
  teamId: string;
  role?: TeamMemberRole;
}

export type UpdateTeamMembershipDto = Partial<CreateTeamMembershipDto>;
