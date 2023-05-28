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
    const userId = req?.user?.id ?? '';
    return this.teamMembershipsService.create(userId, createTeamMembershipDto);
  }

  @Get('team/:id')
  findAll(@Req() req: Request, @Param('id') teamId: string) {
    const userId = req?.user?.id ?? '';
    return this.teamMembershipsService.findAll(userId, teamId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    return this.teamMembershipsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTeamMembershipDto: UpdateTeamMembershipDto
  ) {
    const userId = req?.user?.id ?? '';
    return this.teamMembershipsService.update(
      userId,
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
    const userId = req?.user?.id ?? '';
    return this.teamMembershipsService.remove(userId, teamId, memberId);
  }
}
