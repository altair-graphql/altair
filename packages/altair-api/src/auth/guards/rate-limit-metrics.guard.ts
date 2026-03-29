import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { getAgent } from 'src/newrelic/newrelic';

@Injectable()
export class RateLimitMetricsGuard extends ThrottlerGuard {
  private readonly agent = getAgent();

  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      const request = context.switchToHttp().getRequest();
      const route = request.route?.path || request.path;
      const method = request.method;

      this.agent?.incrementMetric('http.rate_limited');
      this.agent?.recordMetric('http.rate_limited.route', 1);

      const logger = (this as any).logger;
      if (logger) {
        logger.warn(`Rate limit exceeded for ${method} ${route}`);
      }
    }

    return canActivate ?? false;
  }
}
