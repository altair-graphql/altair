import { Module } from '@nestjs/common';
import { QueryCollectionsService } from './query-collections.service';
import { QueryCollectionsController } from './query-collections.controller';
import { TeamsService } from 'src/teams/teams.service';

@Module({
  controllers: [QueryCollectionsController],
  providers: [QueryCollectionsService, TeamsService],
})
export class QueryCollectionsModule {}
