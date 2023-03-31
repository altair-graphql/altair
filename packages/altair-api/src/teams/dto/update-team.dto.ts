import { IUpdateTeamDto } from '@altairgraphql/api-utils';
import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto
  extends PartialType(CreateTeamDto)
  implements IUpdateTeamDto {}
