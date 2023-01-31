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
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateTeamDto, UpdateTeamDto } from '@altairgraphql/firebase-utils';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Req() req: Request, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(req.user.id, createTeamDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.teamsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.teamsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    return this.teamsService.update(req.user.id, id, updateTeamDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.teamsService.remove(req.user.id, id);
  }
}
