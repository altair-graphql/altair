import {
  CallHandler,
  ExecutionContext,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { inspect } from 'util';
import { getAgent } from './newrelic';

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const log = this.logger;
    const agent = getAgent();
    if (!agent) {
      return next.handle();
    }
    this.logger.log(
      `Newrelic Interceptor before: ${inspect(context.getHandler().name)}`
    );
    return agent.startWebTransaction(context.getHandler().name, function () {
      const transaction = agent.getTransaction();
      return next.handle().pipe(
        tap(() => {
          log.log(
            `Newrelic Interceptor after: ${inspect(context.getHandler().name)}`
          );
          return transaction.end();
        })
      );
    });
  }
}
