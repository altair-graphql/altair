// eslint-disable-next-line @typescript-eslint/no-var-requires
require('newrelic');

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';
import { AppModule } from './app.module';
import { CorsConfig, NestConfig, SwaggerConfig } from './common/config';
import { NewrelicInterceptor } from './newrelic/newrelic.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger
  if (process.env.NODE_ENV === 'production') {
    // Use pino logger in production
    app.useLogger(app.get(Logger));
  }

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // Interceptors
  app.useGlobalInterceptors(new NewrelicInterceptor());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // enable shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Prisma Client Exception Filter for unhandled exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  // Swagger Api
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Altair')
      .setDescription(swaggerConfig.description || 'The Altair API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'swagger', app, document);
  }

  // Cors
  if (corsConfig.enabled) {
    app.enableCors();
  }

  const port = process.env.PORT || nestConfig.port;
  console.log('Listening on port', port);
  await app.listen(port);
}
bootstrap();
