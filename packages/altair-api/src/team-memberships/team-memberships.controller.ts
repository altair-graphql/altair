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
import { CreateTeamMembershipDto } from './dto/create-team-membership.dto';
import { UpdateTeamMembershipDto } from './dto/update-team-membership.dto';
import { CreateTeamInvitationDto } from './dto/create-team-invitation.dto';
import { ApiTags } from '@nestjs/swagger';
import { getUserId } from 'src/common/request';

@Controller('team-memberships')
@ApiTags('Team Memberships')
@UseGuards(JwtAuthGuard)
export class TeamMembershipsController {
  constructor(private readonly teamMembershipsService: TeamMembershipsService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() createTeamMembershipDto: CreateTeamMembershipDto
  ) {
    const userId = getUserId(req);
    return this.teamMembershipsService.create(userId, createTeamMembershipDto);
  }

  @Get('team/:id')
  findAll(@Req() req: Request, @Param('id') teamId: string) {
    const userId = getUserId(req);
    return this.teamMembershipsService.findAll(userId, teamId);
  }

  @Get('team/:teamId/member/:memberId')
  findOne(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    const userId = getUserId(req);
    return this.teamMembershipsService.findOne(userId, teamId, memberId);
  }

  @Patch('team/:teamId/member/:memberId')
  update(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() updateTeamMembershipDto: UpdateTeamMembershipDto
  ) {
    const userId = getUserId(req);
    return this.teamMembershipsService.update(
      userId,
      teamId,
      memberId,
      updateTeamMembershipDto
    );
  }

  @Delete('team/:teamId/member/:memberId')
  remove(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    const userId = getUserId(req);
    return this.teamMembershipsService.remove(userId, teamId, memberId);
  }

  // ── Team Invitations ──────────────────────────────────────────────────

  @Post('team/:teamId/invitations')
  async createInvitation(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Body() dto: CreateTeamInvitationDto
  ) {
    const userId = getUserId(req);
    return this.teamMembershipsService.createInvitation(
      userId,
      teamId,
      dto.email,
      dto.role
    );
  }

  @Get('team/:teamId/invitations')
  async listInvitations(@Req() req: Request, @Param('teamId') teamId: string) {
    const userId = getUserId(req);
    return this.teamMembershipsService.listInvitations(userId, teamId);
  }

  @Post('invitations/:token/accept')
  async acceptInvitation(@Req() req: Request, @Param('token') token: string) {
    const userId = getUserId(req);
    return this.teamMembershipsService.acceptInvitation(userId, token);
  }

  @Delete('invitations/:id')
  async revokeInvitation(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    return this.teamMembershipsService.revokeInvitation(userId, id);
  }
}
