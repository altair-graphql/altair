import { Prisma } from '@altairgraphql/db';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    return 'This action adds a new workspace';
  }

  findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        ...this.ownerOrMemberWhere(userId),
      },
      include: {
        QueryCollection: true,
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        ...this.ownerOrMemberWhere(userId),
      },
      include: {
        QueryCollection: true,
      },
    });
  }

  update(userId: string, id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(userId: string, id: string) {
    return `This action removes a #${id} workspace`;
  }

  async count(userId: string, ownOnly = true) {
    return this.prisma.workspace.count({
      where: {
        ...(ownOnly
          ? this.ownerWhere(userId)
          : this.ownerOrMemberWhere(userId)),
      },
    });
  }

  // where user is the owner of the query collection
  ownerWhere(userId: string): Prisma.WorkspaceWhereInput {
    return {
      ownerId: userId,
    };
  }

  // where user has access to the query collection as the owner or team member
  ownerOrMemberWhere(userId: string): Prisma.WorkspaceWhereInput {
    return {
      OR: [
        {
          // workspaces user owns
          ownerId: userId,
        },
        {
          // workspaces owned by user's team
          team: {
            TeamMemberships: {
              some: {
                userId,
              },
            },
          },
        },
      ],
    };
  }
}
