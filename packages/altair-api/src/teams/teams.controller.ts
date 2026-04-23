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
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiTags } from '@nestjs/swagger';
import { getUserId } from 'src/common/request';

@Controller('teams')
@ApiTags('Teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Req() req: Request, @Body() createTeamDto: CreateTeamDto) {
    const userId = getUserId(req);
    return this.teamsService.create(userId, createTeamDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = getUserId(req);
    return this.teamsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    const res = await this.teamsService.findOne(userId, id);

    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    const userId = getUserId(req);
    const res = await this.teamsService.update(userId, id, updateTeamDto);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    const res = await this.teamsService.remove(userId, id);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }
}
