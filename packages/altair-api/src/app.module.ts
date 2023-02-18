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
import pino from 'pino';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelicPino = require('@newrelic/pino-enricher');

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [], // configure your prisma middleware
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    QueriesModule,
    QueryCollectionsModule,
    TeamsModule,
    TeamMembershipsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
