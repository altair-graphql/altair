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
import { QueriesService } from './queries.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateQueryDto } from './dto/create-query.dto';
import { UpdateQueryDto } from './dto/update-query.dto';
import { QueryItem } from '@altairgraphql/db';
import { ApiTags } from '@nestjs/swagger';

@Controller('queries')
@ApiTags('Queries')
@UseGuards(JwtAuthGuard)
export class QueriesController {
  constructor(private readonly queriesService: QueriesService) {}

  @Post()
  create(@Req() req: Request, @Body() createQueryDto: CreateQueryDto) {
    const userId = req?.user?.id ?? '';
    return this.queriesService.create(userId, createQueryDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req?.user?.id ?? '';
    return this.queriesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    return this.queriesService.findOne(userId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateQueryDto: UpdateQueryDto
  ) {
    const userId = req?.user?.id ?? '';
    const res = await this.queriesService.update(userId, id, updateQueryDto);

    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    const res = await this.queriesService.remove(userId, id);

    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Get(':id/revisions')
  async getRevisions(@Req() req: Request, @Param('id') id: string) {
    const userId = req?.user?.id ?? '';
    return this.queriesService.listRevisions(userId, id);
  }

  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('revisionId') revisionId: string
  ): Promise<QueryItem> {
    const userId = req?.user?.id ?? '';
    return this.queriesService.restoreRevision(userId, revisionId);
  }
}
