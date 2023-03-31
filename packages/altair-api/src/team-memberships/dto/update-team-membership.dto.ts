import { IUpdateTeamMembershipDto } from '@altairgraphql/api-utils';
import { PartialType } from '@nestjs/swagger';
import { CreateTeamMembershipDto } from './create-team-membership.dto';

export class UpdateTeamMembershipDto
  extends PartialType(CreateTeamMembershipDto)
  implements IUpdateTeamMembershipDto {}
