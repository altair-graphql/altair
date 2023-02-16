import { Controller, Get, Req, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { map, Subject } from 'rxjs';
import { AppService } from './app.service';
import { ShortJwtAuthGuard } from './auth/guards/short-jwt-auth.guard';
import { EVENTS } from './common/events';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventService: EventEmitter2,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ShortJwtAuthGuard)
  @Sse('events')
  handleUserEvents(@Req() req: Request) {
    const subject$ = new Subject();

    // TODO: Create events
    // TODO: Emit events from prisma middleware
    // TODO: Handle team collection/query changes
    this.eventService.on([EVENTS.COLLECTION_UPDATE], async ({ id }) => {
      // check collection workspace owner
      const userIds = await this.prisma.user.findMany({
        select: {
          id: true,
        },
        where: {
          Workspace: {
            some: {
              QueryCollection: {
                some: {
                  id,
                },
              },
            },
          },
        },
      });
      if (userIds.find((uidd) => uidd.id === req.user.id)) {
        subject$.next({ uid: req.user.id, collectionId: id });
      }
    });
    this.eventService.on([EVENTS.QUERY_UPDATE], async ({ id }) => {
      // check query workspace owner
      const userIds = await this.prisma.user.findMany({
        select: {
          id: true,
        },
        where: {
          Workspace: {
            some: {
              QueryCollection: {
                some: {
                  queries: {
                    some: {
                      id,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (userIds.find((uidd) => uidd.id === req.user.id)) {
        subject$.next({ uid: req.user.id, queryId: id });
      }
    });

    return subject$.pipe(map((data) => ({ data })));
  }
}
