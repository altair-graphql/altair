import { Controller, Get, Param } from '@nestjs/common';
import { QueriesService } from './queries.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('shared')
@ApiTags('Shared')
export class SharedController {
  constructor(private readonly queriesService: QueriesService) {}

  @Get(':shareId')
  async getSharedQuery(@Param('shareId') shareId: string) {
    return this.queriesService.getSharedQuery(shareId);
  }
}
