import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'nestjs-prisma';
import { ConfigModule } from '@nestjs/config';
import { PasswordService } from './auth/password/password.service';
import { QueriesModule } from './queries/queries.module';
import { QueryCollectionsModule } from './query-collections/query-collections.module';
import { TeamsModule } from './teams/teams.module';
import config from './common/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TeamMembershipsModule } from './team-memberships/team-memberships.module';
import { LoggerModule } from 'nestjs-pino';
import { StripeModule } from './stripe/stripe.module';
import { StripeWebhookController } from './stripe-webhook/stripe-webhook.controller';
import { WorkspacesModule } from './workspaces/workspaces.module';

if (process.env.NEW_RELIC_APP_NAME) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const newrelicPino = require('@newrelic/pino-enricher');
}

@Module({
  imports: [
    ...(process.env.NODE_ENV !== 'test' ? [LoggerModule.forRoot()] : []),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [], // configure your prisma middleware
      },
    }),
    EventEmitterModule.forRoot({
      verboseMemoryLeak: true,
    }),
    AuthModule,
    QueriesModule,
    QueryCollectionsModule,
    TeamsModule,
    TeamMembershipsModule,
    StripeModule,
    WorkspacesModule,
  ],
  controllers: [AppController, StripeWebhookController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
