import { PRO_PLAN_ID } from '@altairgraphql/db';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { EVENTS } from 'src/common/events';
import { InvalidRequestException } from 'src/exceptions/invalid-request.exception';
import { CreateQueryDto } from './dto/create-query.dto';
import { UpdateQueryDto } from './dto/update-query.dto';
import {
  queryItemWhereOwner,
  queryItemWhereOwnerOrMember,
  collectionWhereOwnerOrMember,
} from 'src/common/where-clauses';

const DEFAULT_QUERY_REVISION_LIMIT = 10;

@Injectable()
export class QueriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly eventService: EventEmitter2
  ) {}

  async create(userId: string, createQueryDto: CreateQueryDto) {
    // TODO: validate the query content using class-validator
    if (
      !createQueryDto.collectionId ||
      !createQueryDto.name ||
      !createQueryDto.content ||
      !createQueryDto.content.query ||
      createQueryDto.content.version !== 1
    ) {
      throw new BadRequestException();
    }

    // Create new create method that allows team members to create queries if on a pro plan
    if (
      (await this.getPlanConfigByCollection(createQueryDto.collectionId)).id ===
      PRO_PLAN_ID
    ) {
      // Allow team members to create queries. We will apply this to pro plan users only for now and open up when it is more stable.
      return this.createV2(userId, createQueryDto);
    }
    const userPlanConfig = await this.getPlanConfig(userId);
    const userPlanMaxQueryCount = userPlanConfig?.maxQueryCount ?? 0;
    const queryCount = await this.prisma.queryItem.count({
      where: {
        ...queryItemWhereOwner(userId),
      },
    });
    if (queryCount >= userPlanMaxQueryCount) {
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

    // add new revision
    await this.addQueryRevision(userId, res.id);

    this.eventService.emit(EVENTS.QUERY_UPDATE, { id: res.id });

    return res;
  }

  async createV2(userId: string, createQueryDto: CreateQueryDto) {
    // Use the team owner's plan config for the limit checks
    const ownerId = await this.getCollectionOwnerId(createQueryDto.collectionId);
    if (!ownerId) {
      throw new InvalidRequestException('ERR_PERM_DENIED');
    }

    const userPlanConfig = await this.getPlanConfig(ownerId);
    const userPlanMaxQueryCount = userPlanConfig?.maxQueryCount ?? 0;
    // If the user has a pro plan, they can create unlimited queries. So skip the check for the query count.
    // Otherwise, count the queries in the user's personal workspace and the team workspaces they own
    if (userPlanMaxQueryCount < Infinity) {
      // Team owners also own team workspaces, so this should work for both team and personal workspaces
      const queryCount = await this.prisma.queryItem.count({
        where: {
          ...queryItemWhereOwner(ownerId),
        },
      });
      if (queryCount >= userPlanMaxQueryCount) {
        throw new InvalidRequestException('ERR_MAX_QUERY_COUNT');
      }
    }

    // specified collection is owned by the user or the user's team
    const validCollection = await this.prisma.queryCollection.findMany({
      where: {
        id: createQueryDto.collectionId,
        ...collectionWhereOwnerOrMember(userId),
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

    // add new revision
    await this.addQueryRevision(userId, res.id);

    this.eventService.emit(EVENTS.QUERY_UPDATE, { id: res.id });

    return res;
  }

  findAll(userId: string) {
    return this.prisma.queryItem.findMany({
      where: {
        ...queryItemWhereOwnerOrMember(userId),
      },
    });
  }

  async findOne(userId: string, id: string) {
    const query = await this.prisma.queryItem.findFirst({
      where: {
        id,
        ...queryItemWhereOwnerOrMember(userId),
      },
    });

    if (!query) {
      throw new NotFoundException();
    }

    return query;
  }

  async update(userId: string, id: string, updateQueryDto: UpdateQueryDto) {
    const res = await this.prisma.queryItem.updateMany({
      where: {
        id,
        ...queryItemWhereOwnerOrMember(userId),
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

    // add new revision
    await this.addQueryRevision(userId, id);

    return res;
  }

  async remove(userId: string, id: string) {
    const res = await this.prisma.queryItem.deleteMany({
      where: {
        id,
        ...queryItemWhereOwner(userId),
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
          ? queryItemWhereOwner(userId)
          : queryItemWhereOwnerOrMember(userId)),
      },
    });
  }

  listRevisions(userId: string, queryId: string) {
    return this.prisma.queryItemRevision.findMany({
      where: {
        queryItem: {
          id: queryId,
          ...queryItemWhereOwnerOrMember(userId),
        },
      },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async restoreRevision(userId: string, revisionId: string) {
    const revision = await this.prisma.queryItemRevision.findUnique({
      where: {
        id: revisionId,
      },
    });

    if (!revision) {
      throw new NotFoundException();
    }

    // check if the user has access to the query
    const query = await this.findOne(userId, revision.queryItemId);
    if (!query) {
      throw new NotFoundException();
    }

    return this.prisma.queryItem.update({
      where: {
        id: revision.queryItemId,
      },
      data: {
        name: revision.name,
        content: revision.content,
        collectionId: revision.collectionId,
      },
    });
  }

  private async getPlanConfig(userId: string) {
    // TODO: check the team workspace owner quota for the plan config, not the current user's quota (now done in createV2 method)
    // currently the assumption is that the user is the owner of the workspace, and is the only one that can create queries

    const userPlanConfig = await this.userService.getPlanConfig(userId);
    return userPlanConfig;
  }

  private async getCollectionOwnerId(collectionId: string) {
    const res = await this.prisma.queryCollection.findFirst({
      where: {
        id: collectionId,
      },
      select: {
        workspace: {
          select: {
            ownerId: true, // Team owners also own team workspaces, so this should work for both team and personal workspaces
          },
        },
      },
    });

    if (!res) {
      return;
    }

    return res.workspace.ownerId;
  }

  private async getPlanConfigByCollection(collectionId: string) {
    const ownerId = await this.getCollectionOwnerId(collectionId);

    if (!ownerId) {
      return;
    }

    const userPlanConfig = await this.getPlanConfig(ownerId);
    return userPlanConfig;
  }

  private async addQueryRevision(userId: string, queryId: string) {
    // check the query workspace owner quota for query revisions
    // if the quota is exceeded, delete the oldest revision
    const userPlanConfig = await this.getPlanConfig(userId);
    const userPlanQueryRevisionLimit =
      userPlanConfig?.queryRevisionLimit ?? DEFAULT_QUERY_REVISION_LIMIT;
    const query = await this.findOne(userId, queryId);
    const res = await this.prisma.queryItemRevision.create({
      data: {
        queryItemId: queryId,
        createdById: userId,
        name: query.name,
        content: query.content,
        collectionId: query.collectionId,
      },
    });

    // delete the oldest revision if the limit is exceeded
    const revisions = await this.prisma.queryItemRevision.count({
      where: {
        queryItemId: queryId,
      },
    });
    if (revisions > userPlanQueryRevisionLimit) {
      const oldestRevision = await this.prisma.queryItemRevision.findFirst({
        where: {
          queryItemId: queryId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      await this.prisma.queryItemRevision.delete({
        where: {
          id: oldestRevision.id,
        },
      });
    }

    return res;
  }
}
