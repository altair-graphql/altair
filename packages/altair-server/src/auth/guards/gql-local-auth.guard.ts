import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { LocalAuthGuard } from './local-auth.guard';

@Injectable()
export class GqlLocalAuthGuard extends LocalAuthGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    request.body = ctx.getArgs();

    return request;
  }
}
