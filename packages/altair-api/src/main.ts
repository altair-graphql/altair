if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('newrelic');
}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { bootstrapApp } from './app-bootstrap';
import { AppModule } from './app.module';
import { NestConfig } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  await bootstrapApp(app);

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const port = process.env.PORT ?? nestConfig?.port ?? 3000;
  console.log('Listening on port', port);
  await app.listen(port);
}
bootstrap();
