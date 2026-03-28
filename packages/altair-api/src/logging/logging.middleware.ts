import { getLogger } from '@logtape/logtape';
import { Request, Response, NextFunction } from 'express';

const logger = getLogger(['altair-api', 'http']);

/**
 * Express middleware that emits a single canonical log line for every request,
 * including 404s, guard rejections, middleware-level errors, and prematurely
 * closed connections that an interceptor would never see.
 *
 * We listen for both `finish` (normal completion) and `close` (client abort /
 * premature disconnect) and guard against double-logging since both can fire
 * on a normal request.
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  let logged = false;

  const emitLog = () => {
    if (logged) return;
    logged = true;

    const duration = Date.now() - now;
    const status = res.statusCode;
    const aborted = !res.writableFinished;
    const props = {
      method: req.method,
      url: req.originalUrl.split('?').at(0),
      status,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      user: (req as any).user?.id,
      ...(aborted ? { aborted: true } : {}),
    };

    const msg = 'CANONICAL {method} {url} {status} {duration}ms';

    if (aborted || status >= 500) {
      logger.error(msg, props);
    } else if (status >= 400) {
      logger.warn(msg, props);
    } else {
      logger.info(msg, props);
    }
  };

  res.once('finish', emitLog);
  res.once('close', emitLog);

  next();
}
