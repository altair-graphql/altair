import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeamMembershipsService } from './team-memberships.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import {
  CreateTeamMembershipDto,
  UpdateTeamMembershipDto,
} from '@altairgraphql/firebase-utils';

@Controller('team-memberships')
@UseGuards(JwtAuthGuard)
export class TeamMembershipsController {
  constructor(
    private readonly teamMembershipsService: TeamMembershipsService
  ) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() createTeamMembershipDto: CreateTeamMembershipDto
  ) {
    return this.teamMembershipsService.create(
      req.user.id,
      createTeamMembershipDto
    );
  }

  @Get('team/:id')
  findAll(@Req() req: Request, @Param('id') teamId: string) {
    return this.teamMembershipsService.findAll(req.user.id, teamId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.teamMembershipsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTeamMembershipDto: UpdateTeamMembershipDto
  ) {
    return this.teamMembershipsService.update(
      req.user.id,
      id,
      updateTeamMembershipDto
    );
  }

  @Delete('team/:teamId/member/:memberId')
  remove(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    return this.teamMembershipsService.remove(req.user.id, teamId, memberId);
  }
}
