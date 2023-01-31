import { Module } from '@nestjs/common';
import { TeamMembershipsService } from './team-memberships.service';
import { TeamMembershipsController } from './team-memberships.controller';

@Module({
  controllers: [TeamMembershipsController],
  providers: [TeamMembershipsService]
})
export class TeamMembershipsModule {}
