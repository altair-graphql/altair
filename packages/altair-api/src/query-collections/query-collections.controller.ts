import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryCollectionsService } from './query-collections.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CreateQueryCollectionDto,
  UpdateQueryCollectionDto,
} from '@altairgraphql/firebase-utils';

@Controller('query-collections')
@UseGuards(JwtAuthGuard)
export class QueryCollectionsController {
  constructor(
    private readonly queryCollectionsService: QueryCollectionsService
  ) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() createQueryCollectionDto: CreateQueryCollectionDto
  ) {
    return this.queryCollectionsService.create(
      req.user.id,
      createQueryCollectionDto
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.queryCollectionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.queryCollectionsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateQueryCollectionDto: UpdateQueryCollectionDto
  ) {
    return this.queryCollectionsService.update(
      req.user.id,
      id,
      updateQueryCollectionDto
    );
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.queryCollectionsService.remove(req.user.id, id);
  }
}
