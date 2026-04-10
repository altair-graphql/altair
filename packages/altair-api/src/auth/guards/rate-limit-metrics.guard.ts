import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { getTelemetry } from 'src/telemetry/telemetry';

@Injectable()
export class RateLimitMetricsGuard extends ThrottlerGuard {
  private readonly telemetry = getTelemetry();

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

      this.telemetry.incrementMetric('http.rate_limited');
      this.telemetry.incrementMetric(`http.rate_limited.${method}.${route}`);

      const logger = (this as any).logger;
      if (logger) {
        logger.warn(`Rate limit exceeded for ${method} ${route}`);
      }
    }

    return canActivate ?? false;
  }
}
