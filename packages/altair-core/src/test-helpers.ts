import { RequestHandler, ResponseResolver } from 'msw';

export class MswMockRequestHandler extends RequestHandler {
  private lastRequest?: Request;
  constructor(path: string, resolver: ResponseResolver) {
    super({
      info: {
        header: `msw request handler-${path}`,
      },
      resolver,
    });
  }
  parse(...args: Parameters<RequestHandler['parse']>) {
    const [{ request }] = args;
    this.lastRequest = request.clone();
    return super.parse(...args);
  }
  predicate(args: {
    request: Request;
    parsedResult: any;
    resolutionContext?: unknown;
  }): boolean {
    return true;
  }
  log(args: { request: Request; response: Response; parsedResult: any }): void {
    // throw new Error('Method not implemented.');
  }
  receivedRequest() {
    return this.lastRequest?.clone();
  }
}
