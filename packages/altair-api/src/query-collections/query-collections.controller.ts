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
import { QueryCollectionsService } from './query-collections.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateQueryCollectionDto } from './dto/create-query-collection.dto';
import { UpdateQueryCollectionDto } from './dto/update-query-collection.dto';
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

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = getUserId(req);
    const res = await this.queryCollectionsService.remove(userId, id);
    if (!res.count) {
      throw new NotFoundException();
    }

    return res;
  }
}
