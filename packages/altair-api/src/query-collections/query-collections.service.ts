import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/common/events';
import { TeamsService } from 'src/teams/teams.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { UserService } from 'src/auth/user/user.service';
import { CreateQueryCollectionDto } from './dto/create-query-collection.dto';
import { UpdateQueryCollectionDto } from './dto/update-query-collection.dto';
import { MoveCollectionDto } from './dto/move-collection.dto';
import {
  queryItemWhereOwner,
  collectionWhereOwner,
  collectionWhereOwnerOrMember,
  workspaceWhereOwnerOrMember,
} from 'src/common/where-clauses';
import { getAgent } from 'src/newrelic/newrelic';
import { ExportedCollection } from '@altairgraphql/api-utils';

@Injectable()
export class QueryCollectionsService {
  private readonly agent = getAgent();
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly teamsService: TeamsService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(userId: string, createQueryCollectionDto: CreateQueryCollectionDto) {
    let workspaceId = createQueryCollectionDto.workspaceId;
    const teamId = createQueryCollectionDto.teamId;
    const userWorkspace = await this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!workspaceId) {
      workspaceId = userWorkspace?.id;

      if (teamId) {
        // check team workspace
        // Verify that user can create for team
        const validTeam = await this.teamsService.findOne(userId, teamId);

        if (!validTeam) {
          throw new InvalidRequestException(
            'ERR_PERM_DENIED',
            'You cannot create a collection for this teaam.'
          );
        }

        const teamWorkspace = await this.prisma.workspace.findFirst({
          where: {
            teamId: validTeam.id,
          },
        });

        workspaceId = teamWorkspace?.id;
      }
    }

    if (!workspaceId) {
      throw new BadRequestException('Workspace is not valid.');
    }

    const workspaceOwnerId = await this.getWorkspaceOwnerId(workspaceId);

    if (!workspaceOwnerId) {
      throw new BadRequestException('Workspace is not valid.');
    }

    // Count number of queries
    const queryItems = await this.prisma.queryItem.findMany({
      where: {
        ...queryItemWhereOwner(workspaceOwnerId),
      },
    });
    const workspaceOwnerPlanConfig =
      await this.userService.getPlanConfig(workspaceOwnerId);
    const workspaceOwnerPlanMaxQueryCount =
      workspaceOwnerPlanConfig?.maxQueryCount ?? 0;

    const createQueryCollectionDtoQueries = createQueryCollectionDto.queries || [];
    if (
      queryItems.length + createQueryCollectionDtoQueries.length >
      workspaceOwnerPlanMaxQueryCount
    ) {
      throw new InvalidRequestException('ERR_MAX_QUERY_COUNT');
    }

    const res = await this.prisma.queryCollection.create({
      data: {
        name: createQueryCollectionDto.name,
        workspaceId,
        queries: {
          create: createQueryCollectionDtoQueries,
        },
        description: createQueryCollectionDto.description,
        preRequestScript: createQueryCollectionDto.preRequestScript,
        preRequestScriptEnabled: createQueryCollectionDto.preRequestScriptEnabled,
        postRequestScript: createQueryCollectionDto.postRequestScript,
        postRequestScriptEnabled: createQueryCollectionDto.postRequestScriptEnabled,
        headers: createQueryCollectionDto.headers,
        environmentVariables:
          createQueryCollectionDto.environmentVariables as object,
      },
    });
    this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id: res.id });

    this.agent?.incrementMetric('query_collection.create');

    return res;
  }

  async findAll(userId: string) {
    const res = await this.prisma.queryCollection.findMany({
      where: {
        ...collectionWhereOwnerOrMember(userId),
      },
      include: {
        queries: true,
      },
    });

    this.agent?.recordMetric('query_collection.list.count', res.length);

    return res;
  }

  findOne(userId: string, id: string) {
    return this.prisma.queryCollection.findFirst({
      where: {
        id,
        ...collectionWhereOwnerOrMember(userId),
      },
      include: {
        queries: true,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    updateQueryCollectionDto: UpdateQueryCollectionDto
  ) {
    const res = await this.prisma.queryCollection.updateMany({
      where: {
        id,
        ...collectionWhereOwnerOrMember(userId),
      },
      data: {
        name: updateQueryCollectionDto.name,
        description: updateQueryCollectionDto.description,
        preRequestScript: updateQueryCollectionDto.preRequestScript,
        preRequestScriptEnabled: updateQueryCollectionDto.preRequestScriptEnabled,
        postRequestScript: updateQueryCollectionDto.postRequestScript,
        postRequestScriptEnabled: updateQueryCollectionDto.postRequestScriptEnabled,
        headers: updateQueryCollectionDto.headers,
        environmentVariables:
          updateQueryCollectionDto.environmentVariables as object,
      },
    });
    if (res.count) {
      this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id });
    }

    return res;
  }

  async remove(userId: string, id: string) {
    const res = await this.prisma.queryCollection.deleteMany({
      where: {
        id,
        ...collectionWhereOwner(userId),
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id });
      this.agent?.incrementMetric('query_collection.deleted');
    }

    return res;
  }

  // TODO: wouldn't the workspace of the collection conflict with the provided workspaceId in the move request? Should we allow moving across workspaces?
  async moveCollection(userId: string, id: string, moveDto: MoveCollectionDto) {
    // Verify user has access to this collection
    const collection = await this.prisma.queryCollection.findFirst({
      where: {
        id,
        ...collectionWhereOwnerOrMember(userId),
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Prevent circular reference: cannot move a collection into itself
    if (moveDto.parentCollectionId === id) {
      throw new BadRequestException('Cannot move a collection into itself');
    }

    // If a parentCollectionId is specified (not null), verify it exists and user has access
    if (moveDto.parentCollectionId) {
      const parentCollection = await this.prisma.queryCollection.findFirst({
        where: {
          id: moveDto.parentCollectionId,
          ...collectionWhereOwnerOrMember(userId),
        },
      });

      if (!parentCollection) {
        throw new NotFoundException('Parent collection not found');
      }

      // Check for circular reference: parent must not be a descendant of this collection
      let ancestor = parentCollection;
      while (ancestor.parentCollectionId) {
        if (ancestor.parentCollectionId === id) {
          throw new BadRequestException(
            'Cannot move a collection into one of its descendants'
          );
        }
        const next = await this.prisma.queryCollection.findUnique({
          where: { id: ancestor.parentCollectionId },
        });
        if (!next) break;
        ancestor = next;
      }
    }

    // If a workspaceId is specified, verify user has access to it
    const targetWorkspaceId = moveDto.workspaceId ?? collection.workspaceId;
    if (moveDto.workspaceId) {
      const workspace = await this.prisma.workspace.findFirst({
        where: {
          id: moveDto.workspaceId,
          ...workspaceWhereOwnerOrMember(userId),
        },
      });

      if (!workspace) {
        throw new NotFoundException('Target workspace not found');
      }
    }

    const res = await this.prisma.queryCollection.update({
      where: { id },
      data: {
        parentCollectionId:
          moveDto.parentCollectionId === null
            ? null
            : moveDto.parentCollectionId ?? collection.parentCollectionId,
        workspaceId: targetWorkspaceId,
      },
    });

    this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id });

    return res;
  }

  async count(userId: string, ownOnly = true) {
    const cnt = await this.prisma.queryCollection.count({
      where: {
        ...(ownOnly
          ? collectionWhereOwner(userId)
          : collectionWhereOwnerOrMember(userId)),
      },
    });

    this.agent?.recordMetric('query_collection.list.count', cnt);

    return cnt;
  }

  private async getWorkspaceOwnerId(workspaceId: string) {
    const res = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        ownerId: true, // Team owners also own team workspaces, so this should work for both team and personal workspaces
      },
    });

    if (!res) {
      return;
    }

    return res.ownerId;
  }

  /**
   * TODO: This should export in the same format used by the altair app
   * Export a collection tree as a portable JSON structure.
   * Recursively includes all sub-collections and queries.
   */
  async exportCollection(userId: string, id: string) {
    const collection = await this.prisma.queryCollection.findFirst({
      where: {
        id,
        ...collectionWhereOwnerOrMember(userId),
      },
      include: {
        queries: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const result = await this.buildExportTree(userId, collection);
    this.agent?.incrementMetric('query_collection.export');
    return result;
  }

  // TODO: Should export in the same format exported by the app
  private async buildExportTree(
    userId: string,
    collection: any
  ): Promise<ExportedCollection> {
    const children = await this.prisma.queryCollection.findMany({
      where: {
        parentCollectionId: collection.id,
        ...collectionWhereOwnerOrMember(userId),
      },
      include: {
        queries: true,
      },
    });

    const exportedChildren = await Promise.all(
      children.map((child) => this.buildExportTree(userId, child))
    );

    return {
      name: collection.name,
      description: collection.description,
      preRequestScript: collection.preRequestScript,
      preRequestScriptEnabled: collection.preRequestScriptEnabled,
      postRequestScript: collection.postRequestScript,
      postRequestScriptEnabled: collection.postRequestScriptEnabled,
      headers: collection.headers,
      environmentVariables: collection.environmentVariables,
      queries: (collection.queries ?? []).map((q: any) => ({
        name: q.name,
        content: q.content,
        queryVersion: q.queryVersion,
      })),
      collections: exportedChildren,
    };
  }

  /**
   * TODO: Should use the same format used by the altair app
   * Import a previously exported collection tree into a workspace.
   * Recursively creates all sub-collections and queries.
   */
  async importCollection(
    userId: string,
    workspaceId: string,
    data: ExportedCollection,
    parentCollectionId?: string
  ) {
    // Verify workspace access
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ...workspaceWhereOwnerOrMember(userId),
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const result = await this.createImportTree(workspaceId, data, parentCollectionId);
    this.agent?.incrementMetric('query_collection.import');
    return result;
  }

  private async createImportTree(
    workspaceId: string,
    data: ExportedCollection,
    parentCollectionId?: string
  ): Promise<{ id: string; name: string }> {
    const collection = await this.prisma.queryCollection.create({
      data: {
        name: data.name,
        description: data.description,
        preRequestScript: data.preRequestScript,
        preRequestScriptEnabled: data.preRequestScriptEnabled ?? true,
        postRequestScript: data.postRequestScript,
        postRequestScriptEnabled: data.postRequestScriptEnabled ?? true,
        headers: data.headers ?? undefined,
        environmentVariables: data.environmentVariables ?? undefined,
        workspaceId,
        parentCollectionId: parentCollectionId ?? null,
        queries: {
          create: (data.queries ?? []).map((q) => ({
            name: q.name,
            content: q.content ?? {},
            queryVersion: q.queryVersion ?? 1,
          })),
        },
      },
    });

    this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id: collection.id });

    // Recursively create child collections
    if (data.collections?.length) {
      for (const child of data.collections) {
        await this.createImportTree(workspaceId, child, collection.id);
      }
    }

    return { id: collection.id, name: collection.name };
  }
}
