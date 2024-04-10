import { ReturnedWorkspace } from '@altairgraphql/api-utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  workspaceWhereOwner,
  workspaceWhereOwnerOrMember,
} from 'src/common/where-clauses';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    return 'This action adds a new workspace';
  }

  findAll(userId: string): Promise<ReturnedWorkspace[]> {
    return this.prisma.workspace.findMany({
      where: {
        ...workspaceWhereOwnerOrMember(userId),
      },
    });
  }

  findOne(userId: string, id: string): Promise<ReturnedWorkspace> {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        ...workspaceWhereOwnerOrMember(userId),
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
          ? workspaceWhereOwner(userId)
          : workspaceWhereOwnerOrMember(userId)),
      },
    });
  }
}
