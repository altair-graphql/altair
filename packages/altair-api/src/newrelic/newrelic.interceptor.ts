import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { inspect } from 'util';

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!process.env.NEW_RELIC_APP_NAME) {
      return next.handle();
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const newrelic = require('newrelic');
    console.log(
      `Newrelic Interceptor before: ${inspect(context.getHandler().name)}`
    );
    return newrelic.startWebTransaction(context.getHandler().name, function () {
      const transaction = newrelic.getTransaction();
      return next.handle().pipe(
        tap(() => {
          console.log(
            `Newrelic Interceptor after: ${inspect(context.getHandler().name)}`
          );
          return transaction.end();
        })
      );
    });
  }
}
