/**
 * OpenTelemetry must be initialised before any other imports so the SDK
 * can monkey-patch HTTP / Express / etc. modules.
 *
 * Configuration is read from the validated env config (see src/common/env.ts).
 * Set OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS to
 * point at any OTLP-compatible backend (New Relic, Datadog, Grafana, …).
 */
import './telemetry/instrumentation';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getLogger } from '@logtape/logtape';
import { setupLogTape } from './logging/logtape-config';
import { bootstrapApp } from './app-bootstrap';
import { AppModule } from './app.module';
import { NestConfig } from './common/config';
import { PrismaService } from 'nestjs-prisma';

async function bootstrap() {
  // Initialise LogTape before anything else so buffered NestJS logs
  // are captured from the very start.
  await setupLogTape();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  await bootstrapApp(app);

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const port = nestConfig?.port ?? 3000;

  // log query events
  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.$on('query', (event) => {
    console.log(event);
  });

  const logger = getLogger(['altair-api', 'bootstrap']);
  logger.info`Listening on port ${port}`;

  await app.listen(port);
}
bootstrap();
