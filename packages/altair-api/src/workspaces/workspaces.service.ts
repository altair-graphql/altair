import { ReturnedWorkspace } from '@altairgraphql/api-utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  workspaceWhereOwner,
  workspaceWhereOwnerOrMember,
} from 'src/common/where-clauses';
import { getAgent } from 'src/newrelic/newrelic';

@Injectable()
export class WorkspacesService {
  private readonly agent = getAgent();
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    return 'This action adds a new workspace';
  }

  async findAll(userId: string): Promise<ReturnedWorkspace[]> {
    const res = await this.prisma.workspace.findMany({
      where: {
        ...workspaceWhereOwnerOrMember(userId),
      },
    });

    this.agent?.recordMetric('workspace.list.count', res.length);

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
