import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/auth/user/user.service';
import { QueriesService } from 'src/queries/queries.service';
import { QueryCollectionsService } from 'src/query-collections/query-collections.service';
import { StripeService } from 'src/stripe/stripe.service';
import { TeamsService } from 'src/teams/teams.service';

export const testProviders = [
  QueriesService,
  PrismaService,
  EventEmitter2,
  UserService,
  StripeService,
  TeamsService,
  QueryCollectionsService,
];
