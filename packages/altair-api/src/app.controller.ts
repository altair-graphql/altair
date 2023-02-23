import { Controller, Get, Req, Res, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
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
  goHome(@Res() res: Response) {
    return res.redirect('https://altairgraphql.dev');
  }

  @UseGuards(ShortJwtAuthGuard)
  @Sse('events')
  handleUserEvents(@Req() req: Request) {
    const subject$ = new Subject();
    const userId = req.user.id;

    // TODO: Create events
    // TODO: Emit events from prisma middleware
    this.eventService.on([EVENTS.COLLECTION_UPDATE], async ({ id }) => {
      const validUserCollection = await this.prisma.queryCollection.findFirst({
        select: {
          id: true,
        },
        where: {
          id,
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
      });
      if (validUserCollection) {
        subject$.next({ uid: userId, collectionId: id });
      }
    });
    this.eventService.on([EVENTS.QUERY_UPDATE], async ({ id }) => {
      // check query workspace owner
      const validQueryItem = await this.prisma.queryItem.findFirst({
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
      if (validQueryItem) {
        subject$.next({ uid: req.user.id, queryId: id });
      }
    });

    return subject$.pipe(map((data) => ({ data })));
  }
}
