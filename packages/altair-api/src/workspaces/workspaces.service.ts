import { ReturnedWorkspace } from '@altairgraphql/api-utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  workspaceWhereOwner,
  workspaceWhereOwnerOrMember,
} from 'src/common/where-clauses';
import { getTelemetry } from 'src/telemetry/telemetry';

@Injectable()
export class WorkspacesService {
  private readonly telemetry = getTelemetry();
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto
  ): Promise<ReturnedWorkspace> {
    // If a teamId is provided, verify the user is the owner of that team
    if (createWorkspaceDto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: {
          id: createWorkspaceDto.teamId,
          ownerId: userId,
        },
      });

      if (!team) {
        throw new ForbiddenException(
          'You must be the team owner to create a team workspace'
        );
      }
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        ownerId: userId,
        teamId: createWorkspaceDto.teamId,
      },
    });

    this.logger.log(`Workspace created: ${workspace.id} by user ${userId}`);
    return workspace;
  }

  async findAll(userId: string): Promise<ReturnedWorkspace[]> {
    const res = await this.prisma.workspace.findMany({
      where: {
        ...workspaceWhereOwnerOrMember(userId),
      },
    });

    this.telemetry.setGauge('workspace.list.count', res.length);

    return res;
  }

  findOne(userId: string, id: string): Promise<ReturnedWorkspace | null> {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        ...workspaceWhereOwnerOrMember(userId),
      },
    });
  }

  async update(
    userId: string,
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto
  ): Promise<{ count: number }> {
    // Verify user owns this workspace (only owners can update)
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        ...workspaceWhereOwner(userId),
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or not owned by you');
    }

    // If changing teamId, verify user owns the target team
    if (
      updateWorkspaceDto.teamId &&
      updateWorkspaceDto.teamId !== workspace.teamId
    ) {
      if (updateWorkspaceDto.teamId) {
        const team = await this.prisma.team.findFirst({
          where: {
            id: updateWorkspaceDto.teamId,
            ownerId: userId,
          },
        });
        if (!team) {
          throw new ForbiddenException(
            'You must be the team owner to assign a workspace to a team'
          );
        }
      }
    }

    const result = await this.prisma.workspace.updateMany({
      where: {
        id,
        ...workspaceWhereOwner(userId),
      },
      data: {
        ...(updateWorkspaceDto.name !== undefined && {
          name: updateWorkspaceDto.name,
        }),
        ...(updateWorkspaceDto.teamId !== undefined && {
          teamId: updateWorkspaceDto.teamId || null,
        }),
      },
    });

    this.logger.log(`Workspace updated: ${id} by user ${userId}`);
    return result;
  }

  async remove(userId: string, id: string): Promise<{ count: number }> {
    // Verify workspace exists and user owns it
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        ...workspaceWhereOwner(userId),
      },
      include: {
        QueryCollection: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or not owned by you');
    }

    // Prevent deleting workspace if it still has collections
    if (workspace.QueryCollection.length > 0) {
      throw new BadRequestException(
        'Cannot delete workspace that still contains collections. Move or delete them first.'
      );
    }

    // Prevent deleting workspace if it is the last one in a team (teams must have at least one workspace)
    if (workspace.teamId) {
      const teamWorkspaces = await this.prisma.workspace.count({
        where: {
          teamId: workspace.teamId,
        },
      });
      if (teamWorkspaces <= 1) {
        throw new BadRequestException(
          'Cannot delete the last workspace in a team. A team must have at least one workspace.'
        );
      }
    }

    // Prevent deleting workspace if it is the last one owned by the user (users must have at least one workspace)
    const userWorkspaces = await this.prisma.workspace.count({
      where: {
        ownerId: userId,
        teamId: null, // only count personal workspaces for this check
      },
    });
    if (userWorkspaces <= 1) {
      throw new BadRequestException(
        'Cannot delete your last workspace. You must have at least one workspace.'
      );
    }

    const result = await this.prisma.workspace.deleteMany({
      where: {
        id,
        ...workspaceWhereOwner(userId),
      },
    });

    this.logger.log(`Workspace deleted: ${id} by user ${userId}`);
    return result;
  }

  async count(userId: string, ownOnly = true) {
    return this.prisma.workspace.count({
      where: {
        ...(ownOnly
          ? workspaceWhereOwner(userId)
          : workspaceWhereOwnerOrMember(userId)),
      },
    });
  }
}
