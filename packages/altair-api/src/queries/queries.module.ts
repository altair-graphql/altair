import { Module } from '@nestjs/common';
import { QueriesService } from './queries.service';
import { QueriesController } from './queries.controller';

@Module({
  controllers: [QueriesController],
  providers: [QueriesService],
})
export class QueriesModule {}
