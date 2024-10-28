import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { AiService } from 'src/ai/ai.service';
import { UserService } from 'src/auth/user/user.service';
import { CreditService } from 'src/credit/credit.service';
import { EmailService } from 'src/email/email.service';
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
  CreditService,
  AiService,
  ConfigService,
  EmailService,
  {
    provide: ConfigService,
    useValue: {
      get: jest.fn().mockReturnValue('test'),
    },
  },
];
