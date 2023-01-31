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
import { QueriesService } from './queries.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateQueryDto, UpdateQueryDto } from '@altairgraphql/firebase-utils';

@Controller('queries')
@UseGuards(JwtAuthGuard)
export class QueriesController {
  constructor(private readonly queriesService: QueriesService) {}

  @Post()
  create(@Req() req: Request, @Body() createQueryDto: CreateQueryDto) {
    return this.queriesService.create(req.user.id, createQueryDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.queriesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.queriesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateQueryDto: UpdateQueryDto
  ) {
    return this.queriesService.update(req.user.id, id, updateQueryDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.queriesService.remove(req.user.id, id);
  }
}
