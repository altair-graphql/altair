import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { getLogger } from '@logtape/logtape';
import { Observable, tap } from 'rxjs';
import { inspect } from 'util';
import { getAgent } from './newrelic';

const logger = getLogger(['altair-api', 'NewrelicInterceptor']);

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const agent = getAgent();
    if (!agent) {
      return next.handle();
    }
    logger.info`Newrelic Interceptor before: ${inspect(context.getHandler().name)}`;
    return agent.startWebTransaction(context.getHandler().name, function () {
      const transaction = agent.getTransaction();
      return next.handle().pipe(
        tap(() => {
          logger.info`Newrelic Interceptor after: ${inspect(context.getHandler().name)}`;
          return transaction.end();
        })
      );
    });
  }
}
