import { Module } from '@nestjs/common';
import { QueryCollectionsService } from './query-collections.service';
import { QueryCollectionsController } from './query-collections.controller';
import { TeamsService } from 'src/teams/teams.service';
import { AuthModule } from 'src/auth/auth.module';
import { TeamMembershipsModule } from 'src/team-memberships/team-memberships.module';

@Module({
  imports: [AuthModule, TeamMembershipsModule],
  controllers: [QueryCollectionsController],
  providers: [QueryCollectionsService, TeamsService],
})
export class QueryCollectionsModule {}
