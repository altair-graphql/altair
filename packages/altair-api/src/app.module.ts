import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'nestjs-prisma';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './auth/password/password.service';
import { QueriesModule } from './queries/queries.module';
import { QueryCollectionsModule } from './query-collections/query-collections.module';
import { TeamsModule } from './teams/teams.module';
import config, { RateLimitConfig } from './common/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TeamMembershipsModule } from './team-memberships/team-memberships.module';
import { StripeModule } from './stripe/stripe.module';
import { StripeWebhookController } from './stripe-webhook/stripe-webhook.controller';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CreditModule } from './credit/credit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { EmailService } from './email/email.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { RateLimitMetricsGuard } from './auth/guards/rate-limit-metrics.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rateLimitConfig = configService.get<RateLimitConfig>('rateLimit');
        return {
          throttlers: [
            {
              name: 'default',
              ttl: rateLimitConfig?.ttl ?? 60000,
              limit: rateLimitConfig?.limit ?? 60,
            },
          ],
        };
      },
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        // Use client extension for query metrics (Prisma middleware is deprecated)
        // middlewares: [new PrismaMetricsMiddleware()],
      },
      // Enable query logging for metrics capture
      // explicitConnect: false,
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
  providers: [
    AppService,
    PasswordService,
    EmailService,
    RateLimitMetricsGuard,
    {
      provide: APP_GUARD,
      useClass: RateLimitMetricsGuard,
    },
  ],
})
export class AppModule {}
