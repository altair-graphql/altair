import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getLogger } from '@logtape/logtape';

const logger = getLogger(['altair-api', 'exception-filter']);

/**
 * Global catch-all exception filter.
 *
 * - Known `HttpException`s are logged and returned with their original status.
 * - Unknown/unexpected errors are logged at `error` level with the full stack
 *   trace and returned as a generic 500 response (no internal details leaked).
 *
 * Register this filter **before** more specific filters (e.g.
 * `PrismaClientExceptionFilter`) in `useGlobalFilters()` so that NestJS
 * evaluates the specific filters first, and this one acts as the fallback.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const method = httpAdapter.getRequestMethod(request);
    const url = httpAdapter.getRequestUrl(request);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (status >= 500) {
        logger.error('Unhandled server error: {method} {url} {status}', {
          method,
          url,
          status,
          error: exception,
          stack: exception.stack,
        });
      } else {
        logger.warn('HTTP exception: {method} {url} {status}', {
          method,
          url,
          status,
          message:
            typeof response === 'string' ? response : (response as any)?.message,
        });
      }

      httpAdapter.reply(ctx.getResponse(), response, status);
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      logger.error('Unexpected exception: {method} {url} {status}', {
        method,
        url,
        status,
        error: exception instanceof Error ? exception : undefined,
        stack: exception instanceof Error ? exception.stack : undefined,
        raw: !(exception instanceof Error) ? String(exception) : undefined,
      });

      httpAdapter.reply(
        ctx.getResponse(),
        {
          statusCode: status,
          message: 'Internal server error',
        },
        status
      );
    }
  }
}
