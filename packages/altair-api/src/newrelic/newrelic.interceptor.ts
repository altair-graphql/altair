import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import util from 'util';
import newrelic from 'newrelic';

@Injectable()
export class NewrelicInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!process.env.NEW_RELIC_APP_NAME) {
      return next.handle();
    }
    console.log(
      `Parent Interceptor before: ${util.inspect(context.getHandler().name)}`
    );
    return newrelic.startWebTransaction(context.getHandler().name, function () {
      const transaction = newrelic.getTransaction();
      return next.handle().pipe(
        tap(() => {
          console.log(
            `Parent Interceptor after: ${util.inspect(
              context.getHandler().name
            )}`
          );
          return transaction.end();
        })
      );
    });
  }
}
