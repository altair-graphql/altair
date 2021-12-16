import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesResolver } from './workspaces.resolver';

@Module({
  providers: [WorkspacesResolver, WorkspacesService]
})
export class WorkspacesModule {}
