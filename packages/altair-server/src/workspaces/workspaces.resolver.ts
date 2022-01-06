import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WorkspacesService } from './workspaces.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/gql-current-user.decorator';
import { CreateWorkspaceInput } from 'src/types/graphql';
import { RequestUser } from 'src/auth/types';

@UseGuards(GqlJwtAuthGuard)
@Resolver('Workspace')
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Mutation('createWorkspace')
  create(
    @Args('createWorkspaceInput') createWorkspaceInput: CreateWorkspaceInput,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workspacesService.create({
      ...createWorkspaceInput,
      owner: user.id,
    });
  }

  @Query('workspaces')
  findAll(@CurrentUser() user: RequestUser) {
    return this.workspacesService.findByOwnerId(user.id);
  }

  @Query('workspace')
  findOne(@Args('id') id: number) {
    return this.workspacesService.findOne(id);
  }

  @Mutation('updateWorkspace')
  update(
    @Args('updateWorkspaceInput') updateWorkspaceInput: UpdateWorkspaceDto,
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
