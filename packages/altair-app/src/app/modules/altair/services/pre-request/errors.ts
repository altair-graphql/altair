export class RequestScriptError extends Error {
  cause: Error;

  constructor(error: Error) {
    super(error.message);
    this.name = 'RequestScriptError';
    this.cause = error;
  }
}
