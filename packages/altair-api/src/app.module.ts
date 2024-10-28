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
import { StripeModule } from './stripe/stripe.module';
import { StripeWebhookController } from './stripe-webhook/stripe-webhook.controller';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CreditModule } from './credit/credit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';
import { AiModule } from './ai/ai.module';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.ms(),
            utilities.format.nestLike('AltairGraphQLApi', {
              colors: true,
              prettyPrint: true,
            })
          ),
        }),
      ],
    }),
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
    ScheduleModule.forRoot(),
    AuthModule,
    QueriesModule,
    QueryCollectionsModule,
    TeamsModule,
    TeamMembershipsModule,
    StripeModule,
    WorkspacesModule,
    CreditModule,
    AiModule,
  ],
  controllers: [AppController, StripeWebhookController],
  providers: [AppService, PasswordService, EmailService],
})
export class AppModule {}
