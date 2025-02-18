import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

const tagsToString = (tags: Record<string, unknown>) => {
  return Object.entries(tags)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');
};
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const tags: Record<string, unknown> = {
      url: req.originalUrl.replace(/\?.*$/, ''),
      method: req.method,
      ip: req.ip,
      user: req.user?.id,
    };

    this.logger.log(`PRE: ${tagsToString(tags)}`);

    const now = Date.now();
    return next.handle().pipe(
      tap((x) => {
        tags.duration = `${Date.now() - now}ms`;
        this.logger.log(`POST: ${tagsToString(tags)}`);
      })
    );
  }
}
