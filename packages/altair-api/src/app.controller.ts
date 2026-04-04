import { IPlanInfo } from '@altairgraphql/api-utils';
import { Controller, Get, Req, Res, Sse, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { map, Observable, Subject } from 'rxjs';
import { AppService } from './app.service';
import { EventsJwtAuthGuard } from './auth/guards/events-jwt-auth.guard';
import { EVENTS } from './common/events';
import { StripeService } from './stripe/stripe.service';
import { SkipThrottle } from '@nestjs/throttler';
import { getTelemetry } from './telemetry/telemetry';

@Controller()
export class AppController {
  private readonly telemetry = getTelemetry();

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

  @SkipThrottle()
  @UseGuards(EventsJwtAuthGuard)
  @Sse('events')
  handleUserEvents(@Req() req: Request): Observable<unknown> {
    const subject$ = new Subject();
    const userId = req?.user?.id;

    this.telemetry.incrementMetric('sse.connections.active');

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
        this.telemetry.incrementMetric('sse.events.emitted.collection-update');
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
        this.telemetry.incrementMetric('sse.events.emitted.query-update');
      }
    };
    this.eventService.on([EVENTS.QUERY_UPDATE], queryUpdateListener);

    const teamMembershipUpdateListener = async ({
      teamId,
      userId: affectedUserId,
      action,
    }: {
      teamId: string;
      userId: string;
      action: string;
    }) => {
      // Notify team owner and all existing members
      const team = await this.prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [{ ownerId: userId }, { TeamMemberships: { some: { userId } } }],
        },
        select: { id: true },
      });

      if (team) {
        subject$.next({
          uid: userId,
          event: 'team-membership-update',
          teamId,
          affectedUserId,
          action,
        });
        this.telemetry.incrementMetric('sse.events.emitted.team-membership-update');
      }
    };
    this.eventService.on(
      [EVENTS.TEAM_MEMBERSHIP_UPDATE],
      teamMembershipUpdateListener
    );

    const planUpdateListener = ({ userId: affectedUserId, planId }: any) => {
      if (affectedUserId === userId) {
        subject$.next({
          uid: userId,
          event: 'plan-update',
          planId,
        });
        this.telemetry.incrementMetric('sse.events.emitted.plan-update');
      }
    };
    this.eventService.on([EVENTS.PLAN_UPDATE], planUpdateListener);

    const creditUpdateListener = ({ userId: affectedUserId, ...rest }: any) => {
      if (affectedUserId === userId) {
        subject$.next({
          uid: userId,
          event: 'credit-update',
          ...rest,
        });
        this.telemetry.incrementMetric('sse.events.emitted.credit-update');
      }
    };
    this.eventService.on([EVENTS.CREDIT_UPDATE], creditUpdateListener);

    // Clean up listeners when the client disconnects
    req.on('close', () => {
      this.eventService.off([EVENTS.COLLECTION_UPDATE], collectionUpdateListener);
      this.eventService.off([EVENTS.QUERY_UPDATE], queryUpdateListener);
      this.eventService.off(
        [EVENTS.TEAM_MEMBERSHIP_UPDATE],
        teamMembershipUpdateListener
      );
      this.eventService.off([EVENTS.PLAN_UPDATE], planUpdateListener);
      this.eventService.off([EVENTS.CREDIT_UPDATE], creditUpdateListener);
      subject$.complete();
      this.telemetry.incrementMetric('sse.connections.disconnected');
    });

    return subject$.pipe(map((data) => ({ data })));
  }
}
