export class RequestScriptError extends Error {
  cause: Error;

  constructor(error: Error | string) {
    const message = error instanceof Error ? error.message : error;
    super(message);
    this.name = 'RequestScriptError';
    this.cause = error instanceof Error ? error : new Error(error);
  }
}
