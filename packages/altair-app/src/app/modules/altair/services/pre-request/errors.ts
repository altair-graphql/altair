export class RequestScriptError extends Error {
  cause: Error;

  constructor(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    super(message);
    this.name = 'RequestScriptError';
    this.cause = error instanceof Error ? error : new Error(String(error));
  }
}
