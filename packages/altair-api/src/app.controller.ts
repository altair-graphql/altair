import { IPlanInfo } from '@altairgraphql/api-utils';
import {
  Controller,
  Get,
  OnModuleDestroy,
  Req,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { map, Observable, Subject } from 'rxjs';
import { AppService } from './app.service';
import { EventsJwtAuthGuard } from './auth/guards/events-jwt-auth.guard';
import { EVENTS } from './common/events';
import { StripeService } from './stripe/stripe.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventService: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService
  ) {}

  @Get()
  goHome(@Res() res: Response) {
    return res.redirect('https://altairgraphql.dev');
  }

  @Get('plans')
  getPlans(): Promise<IPlanInfo[]> {
    return this.stripeService.getPlanInfos();
  }

  @UseGuards(EventsJwtAuthGuard)
  @Sse('events')
  handleUserEvents(@Req() req: Request): Observable<unknown> {
    const subject$ = new Subject();
    const userId = req?.user?.id;

    // TODO: Create events
    // TODO: Emit events from prisma middleware
    const collectionUpdateListener = async ({ id }: any) => {
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
    };
    this.eventService.on([EVENTS.COLLECTION_UPDATE], collectionUpdateListener);

    const queryUpdateListener = async ({ id }: any) => {
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
        subject$.next({ uid: req?.user?.id, queryId: id });
      }
    };
    this.eventService.on([EVENTS.QUERY_UPDATE], queryUpdateListener);

    return subject$.pipe(map((data) => ({ data })));
  }
}
