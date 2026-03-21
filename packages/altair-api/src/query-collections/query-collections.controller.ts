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
  NotFoundException,
} from '@nestjs/common';
import { QueryCollectionsService, ExportedCollection } from './query-collections.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateQueryCollectionDto } from './dto/create-query-collection.dto';
import { UpdateQueryCollectionDto } from './dto/update-query-collection.dto';
import { MoveCollectionDto } from './dto/move-collection.dto';
import { ImportCollectionDto } from './dto/import-collection.dto';
import { ApiTags } from '@nestjs/swagger';
import { getUserId } from 'src/common/request';

@Controller('query-collections')
@ApiTags('Query Collections')
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
    const userId = getUserId(req);
    return this.queryCollectionsService.create(
      userId,
      createQueryCollectionDto
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = getUserId(req);
    return this.queryCollectionsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    const collection = await this.queryCollectionsService.findOne(userId, id);

    if (!collection) {
      throw new NotFoundException();
    }

    return collection;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateQueryCollectionDto: UpdateQueryCollectionDto
  ) {
    const userId = getUserId(req);
    const res = await this.queryCollectionsService.update(
      userId,
      id,
      updateQueryCollectionDto
    );

    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Patch(':id/move')
  async move(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() moveCollectionDto: MoveCollectionDto
  ) {
    const userId = getUserId(req);
    return this.queryCollectionsService.moveCollection(
      userId,
      id,
      moveCollectionDto
    );
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    const res = await this.queryCollectionsService.remove(userId, id);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }

  @Get(':id/export')
  async exportCollection(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    return this.queryCollectionsService.exportCollection(userId, id);
  }

  @Post('import')
  async importCollection(
    @Req() req: Request,
    @Body() importDto: ImportCollectionDto
  ) {
    const userId = getUserId(req);
    return this.queryCollectionsService.importCollection(
      userId,
      importDto.workspaceId,
      importDto.data,
      importDto.parentCollectionId
    );
  }
}
