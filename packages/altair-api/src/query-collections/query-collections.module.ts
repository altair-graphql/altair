import { Module } from '@nestjs/common';
import { QueryCollectionsService } from './query-collections.service';
import { QueryCollectionsController } from './query-collections.controller';
import { TeamsService } from 'src/teams/teams.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [QueryCollectionsController],
  providers: [QueryCollectionsService, TeamsService],
})
export class QueryCollectionsModule {}
