import { getLogger } from '@logtape/logtape';
import { Request, Response, NextFunction } from 'express';

const logger = getLogger(['altair-api', 'http']);

/**
 * Express middleware that emits a single canonical log line for every request,
 * including 404s, guard rejections, and middleware-level errors that an
 * interceptor would never see.
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();

  res.once('finish', () => {
    const duration = Date.now() - now;
    const status = res.statusCode;
    const props = {
      method: req.method,
      url: req.originalUrl.split('?').at(0),
      status,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      user: (req as any).user?.id,
    };

    const msg = 'CANONICAL {method} {url} {status} {duration}ms';

    if (status >= 500) {
      logger.error(msg, props);
    } else if (status >= 400) {
      logger.warn(msg, props);
    } else {
      logger.info(msg, props);
    }
  });

  next();
}
