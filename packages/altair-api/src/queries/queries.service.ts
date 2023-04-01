import { Prisma } from '@altairgraphql/db';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { EVENTS } from 'src/common/events';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { CreateQueryDto } from './dto/create-query.dto';
import { UpdateQueryDto } from './dto/update-query.dto';

@Injectable()
export class QueriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(userId: string, createQueryDto: CreateQueryDto) {
    const userPlanConfig = await this.userService.getPlanConfig(userId);
    const queryCount = await this.prisma.queryItem.count({
      where: {
        collection: {
          workspace: {
            ownerId: userId,
          },
        },
      },
    });
    if (queryCount >= userPlanConfig.maxQueryCount) {
      throw new InvalidRequestException('ERR_MAX_QUERY_COUNT');
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
      throw new InvalidRequestException(
        'ERR_PERM_DENIED',
        'You do not have the permission to add a query to this collection'
      );
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
        ...this.ownerOrMemberWhere(userId),
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.queryItem.findFirst({
      where: {
        id,
        ...this.ownerOrMemberWhere(userId),
      },
    });
  }

  async update(userId: string, id: string, updateQueryDto: UpdateQueryDto) {
    const res = await this.prisma.queryItem.updateMany({
      where: {
        id,
        ...this.ownerOrMemberWhere(userId),
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
        id,
        ...this.ownerWhere(userId),
      },
    });

    if (res.count) {
      this.eventService.emit(EVENTS.QUERY_UPDATE, { id });
    }

    return res;
  }

  async count(userId: string, ownOnly = true) {
    return this.prisma.queryItem.count({
      where: {
        ...(ownOnly
          ? this.ownerWhere(userId)
          : this.ownerOrMemberWhere(userId)),
      },
    });
  }

  // where user is the owner of the query
  ownerWhere(userId: string): Prisma.QueryItemWhereInput {
    return {
      collection: {
        workspace: {
          ownerId: userId,
        },
      },
    };
  }

  // where user has access to the query as the owner or team member
  ownerOrMemberWhere(userId: string): Prisma.QueryItemWhereInput {
    return {
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
    };
  }
}
