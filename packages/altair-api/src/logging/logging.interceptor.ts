import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap } from 'rxjs';

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
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const tags: Record<string, unknown> = {
      url: request.originalUrl.split('?').at(0),
      method: request.method,
      ip: request.ip,
      user: request.user?.id,
    };

    // this.logger.log(`PRE: ${tagsToString(tags)}`);

    const now = Date.now();
    return next.handle().pipe(
      catchError((error) => {
        tags.error = error.message;
        tags.duration = `${Date.now() - now}ms`;
        tags.status = error.status;
        tags.size = response.get('content-length');

        this.logger.error(`canonical ${tagsToString(tags)}`);

        throw error;
      }),
      tap((x) => {
        tags.duration = `${Date.now() - now}ms`;
        tags.status = response.statusCode;
        tags.size = response.get('content-length');

        this.logger.log(`canonical ${tagsToString(tags)}`);
      })
    );
  }
}
