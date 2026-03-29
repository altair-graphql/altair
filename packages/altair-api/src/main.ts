if (process.env.NEW_RELIC_APP_NAME && process.env.NODE_ENV === 'production') {
  /**
   * New Relic should be required as early as possible in the application lifecycle, ideally before any other modules are imported.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('newrelic');
}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getLogger } from '@logtape/logtape';
import { setupLogTape } from './logging/logtape-config';
import { bootstrapApp } from './app-bootstrap';
import { AppModule } from './app.module';
import { NestConfig } from './common/config';

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

  const logger = getLogger(['altair-api', 'bootstrap']);
  logger.info`Listening on port ${port}`;

  await app.listen(port);
}
bootstrap();
