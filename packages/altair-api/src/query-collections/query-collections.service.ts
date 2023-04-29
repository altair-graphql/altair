import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/common/events';
import { TeamsService } from 'src/teams/teams.service';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { UserService } from 'src/auth/user/user.service';
import { CreateQueryCollectionDto } from './dto/create-query-collection.dto';
import { UpdateQueryCollectionDto } from './dto/update-query-collection.dto';
import { Prisma } from '@altairgraphql/db';

@Injectable()
export class QueryCollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly teamsService: TeamsService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(
    userId: string,
    createQueryCollectionDto: CreateQueryCollectionDto
  ) {
    let workspaceId = createQueryCollectionDto.workspaceId;
    const teamId = createQueryCollectionDto.teamId;
    const userPlanConfig = await this.userService.getPlanConfig(userId);
    const userWorkspace = await this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!workspaceId) {
      workspaceId = userWorkspace.id;

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

        workspaceId = teamWorkspace.id;
      }
    }

    if (!workspaceId) {
      throw new BadRequestException('Workspace is not valid.');
    }

    // Count number of queries
    const queryItems = await this.prisma.queryItem.findMany({
      where: {
        AND: {
          collection: {
            OR: [
              {
                // queries user owns
                workspace: {
                  ownerId: userId,
                },
              },
              {
                // queries owned by user's team
                workspace: {
                  team: {
                    ownerId: userId,
                  },
                },
              },
            ],
          },
        },
      },
    });

    if (
      queryItems.length + createQueryCollectionDto.queries.length >
      userPlanConfig.maxQueryCount
    ) {
      throw new InvalidRequestException('ERR_MAX_QUERY_COUNT');
    }

    const res = await this.prisma.queryCollection.create({
      data: {
        name: createQueryCollectionDto.name,
        workspaceId,
        queries: {
          create: createQueryCollectionDto.queries,
        },
      },
    });
    this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id: res.id });

    return res;
  }

  findAll(userId: string) {
    return this.prisma.queryCollection.findMany({
      where: {
        ...this.ownerOrMemberWhere(userId),
      },
      include: {
        queries: true,
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.queryCollection.findFirst({
      where: {
        id,
        ...this.ownerOrMemberWhere(userId),
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
        ...this.ownerOrMemberWhere(userId),
      },
      data: {
        name: updateQueryCollectionDto.name,
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
        ...this.ownerWhere(userId),
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id });
    }

    return res;
  }

  async count(userId: string, ownOnly = true) {
    return this.prisma.queryCollection.count({
      where: {
        ...(ownOnly
          ? this.ownerWhere(userId)
          : this.ownerOrMemberWhere(userId)),
      },
    });
  }

  // where user is the owner of the query collection
  ownerWhere(userId: string): Prisma.QueryCollectionWhereInput {
    return {
      workspace: {
        ownerId: userId,
      },
    };
  }

  // where user has access to the query collection as the owner or team member
  ownerOrMemberWhere(userId: string): Prisma.QueryCollectionWhereInput {
    return {
      OR: [
        {
          // queries user owns
          workspace: {
            ownerId: userId,
          },
        },
        {
          // queries owned by user's team
          workspace: {
            team: {
              TeamMemberships: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      ],
    };
  }
}
