import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateQueryCollectionDto,
  UpdateQueryCollectionDto,
} from '@altairgraphql/firebase-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/common/events';

@Injectable()
export class QueryCollectionsService {
  constructor(
    private readonly prisma: PrismaService,
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

    const res = await this.prisma.queryCollection.create({
      data: {
        name: createQueryCollectionDto.name,
        workspaceId: userWorkspace.id,
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
        workspace: {
          ownerId: userId,
        },
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
