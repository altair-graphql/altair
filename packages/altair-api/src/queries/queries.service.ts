import { CreateQueryDto, UpdateQueryDto } from '@altairgraphql/api-utils';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { EVENTS } from 'src/common/events';

@Injectable()
export class QueriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(userId: string, createQueryDto: CreateQueryDto) {
    const basicPlan = await this.prisma.planConfig.findUnique({
      where: {
        id: 'basic',
      },
    });
    const queryCount = await this.prisma.queryItem.count({
      where: {
        collection: {
          workspace: {
            ownerId: userId,
          },
        },
      },
    });
    if (queryCount >= basicPlan.maxQueryCount) {
      throw new ForbiddenException();
    }

    // specified collection is owned by the user
    const validCollection = await this.prisma.queryCollection.findMany({
      where: {
        id: createQueryDto.collectionId,
        workspace: {
          ownerId: userId,
        },
      },
    });

    if (!validCollection.length) {
      throw new ForbiddenException();
    }

    const res = await this.prisma.queryItem.create({
      data: {
        collectionId: createQueryDto.collectionId,
        name: createQueryDto.name,
        queryVersion: createQueryDto.content.version,
        content: createQueryDto.content,
      },
    });

    this.eventService.emit(EVENTS.QUERY_UPDATE, { id: res.id });

    return res;
  }

  findAll(userId: string) {
    return this.prisma.queryItem.findMany({
      where: {
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
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.queryItem.findFirst({
      where: {
        AND: {
          id,
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
        },
      },
    });
  }

  async update(userId: string, id: string, updateQueryDto: UpdateQueryDto) {
    const res = await this.prisma.queryItem.updateMany({
      where: {
        id,
        AND: {
          id,
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
        },
      },
      data: {
        name: updateQueryDto.name,
        collectionId: updateQueryDto.collectionId,
        content: updateQueryDto.content,
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.QUERY_UPDATE, { id });
    }

    return res;
  }

  async remove(userId: string, id: string) {
    const res = await this.prisma.queryItem.deleteMany({
      where: {
        AND: {
          id,
          collection: {
            workspace: {
              ownerId: userId,
            },
          },
        },
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.QUERY_UPDATE, { id });
    }

    return res;
  }
}
