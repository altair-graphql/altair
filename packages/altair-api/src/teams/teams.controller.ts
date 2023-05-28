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
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Req() req: Request, @Body() createTeamDto: CreateTeamDto) {
    const userId = req?.user?.id ?? '';
    return this.teamsService.create(userId, createTeamDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req?.user?.id ?? '';
    return this.teamsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
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
    const userId = req?.user?.id ?? '';
    const res = await this.teamsService.update(userId, id, updateTeamDto);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    const res = await this.teamsService.remove(userId, id);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }
}
