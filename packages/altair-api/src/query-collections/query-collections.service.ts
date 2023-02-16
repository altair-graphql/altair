import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateQueryCollectionDto,
  UpdateQueryCollectionDto,
} from '@altairgraphql/api-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/common/events';
import { TeamsService } from 'src/teams/teams.service';

@Injectable()
export class QueryCollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(
    userId: string,
    createQueryCollectionDto: CreateQueryCollectionDto
  ) {
    const userWorkspace = await this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
      },
    });

    let workspaceId = userWorkspace.id;

    const teamId = createQueryCollectionDto.teamId;
    if (teamId) {
      // check team workspace
      // Verify that user can create for team
      const validTeam = await this.teamsService.findOne(userId, teamId);

      if (!validTeam) {
        throw new BadRequestException(
          'You cannot create a collection for this teaam'
        );
      }

      const teamWorkspace = await this.prisma.workspace.findFirst({
        where: {
          teamId: validTeam.id,
        },
      });

      workspaceId = teamWorkspace.id;
    }

    if (!workspaceId) {
      throw new BadRequestException();
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
        workspace: {
          ownerId: userId,
        },
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
        workspace: {
          ownerId: userId,
        },
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
        workspace: {
          ownerId: userId,
        },
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.COLLECTION_UPDATE, { id });
    }

    return res;
  }
}
