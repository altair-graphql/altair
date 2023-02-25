import { Module } from '@nestjs/common';
import { TeamMembershipsService } from './team-memberships.service';
import { TeamMembershipsController } from './team-memberships.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeamMembershipsController],
  providers: [TeamMembershipsService],
})
export class TeamMembershipsModule {}
