import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/common/events';
import { TeamsService } from 'src/teams/teams.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { UserService } from 'src/auth/user/user.service';
import { CreateQueryCollectionDto } from './dto/create-query-collection.dto';
import { UpdateQueryCollectionDto } from './dto/update-query-collection.dto';
import {
  queryItemWhereOwner,
  collectionWhereOwner,
  collectionWhereOwnerOrMember,
} from 'src/common/where-clauses';
import { getAgent } from 'src/newrelic/newrelic';

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
        variables: createQueryCollectionDto.variables,
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
        variables: updateQueryCollectionDto.variables,
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
    }

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
}
