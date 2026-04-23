import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';
import { CorsConfig, SwaggerConfig } from './common/config';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { LogTapeLoggerService } from './logging/logtape-logger.service';
import { loggingMiddleware } from './logging/logging.middleware';

export const bootstrapApp = async (app: INestApplication) => {
  // Logger — delegates all NestJS logging to LogTape
  app.useLogger(new LogTapeLoggerService());

  // Canonical log line — must be registered before anything else so it
  // captures every request including 404s and guard rejections.
  app.use(loggingMiddleware);

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // enable shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  const configService = app.get(ConfigService);
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  // Swagger Api
  if (swaggerConfig?.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Altair')
      .setDescription(swaggerConfig.description || 'The Altair API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'swagger', app, document);
  }

  // Cors
  if (corsConfig?.enabled) {
    app.enableCors({ origin: true });
  }

  return app;
};
