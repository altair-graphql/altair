import { CreateQueryDto, UpdateQueryDto } from '@altairgraphql/firebase-utils';
import { Injectable } from '@nestjs/common';
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
    // TODO: Verify collectionId
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
          workspace: {
            ownerId: userId,
          },
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
            workspace: {
              ownerId: userId,
            },
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
            workspace: {
              ownerId: userId,
            },
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
