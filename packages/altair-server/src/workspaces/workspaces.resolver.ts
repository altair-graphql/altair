import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';

@Resolver('Workspace')
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Mutation('createWorkspace')
  create(
    @Args('createWorkspaceInput') createWorkspaceInput: CreateWorkspaceInput,
  ) {
    return this.workspacesService.create(createWorkspaceInput);
  }

  @Query('workspaces')
  findAll() {
    return this.workspacesService.findAll();
  }

  @Query('workspace')
  findOne(@Args('id') id: number) {
    return this.workspacesService.findOne(id);
  }

  @Mutation('updateWorkspace')
  update(
    @Args('updateWorkspaceInput') updateWorkspaceInput: UpdateWorkspaceInput,
  ) {
    return this.workspacesService.update(
      updateWorkspaceInput.id,
      updateWorkspaceInput,
    );
  }

  @Mutation('removeWorkspace')
  remove(@Args('id') id: number) {
    return this.workspacesService.remove(id);
  }
}
