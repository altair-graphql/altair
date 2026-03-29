import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TeamMembershipsModule } from 'src/team-memberships/team-memberships.module';

@Module({
  imports: [AuthModule, TeamMembershipsModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
