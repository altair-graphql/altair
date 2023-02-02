import { Module } from '@nestjs/common';
import { QueryCollectionsService } from './query-collections.service';
import { QueryCollectionsController } from './query-collections.controller';

@Module({
  controllers: [QueryCollectionsController],
  providers: [QueryCollectionsService]
})
export class QueryCollectionsModule {}
