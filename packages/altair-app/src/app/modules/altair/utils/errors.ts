import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { debug } from './logger';

export const catchUselessObservableError = catchError((err) => {
  debug.error(
    'Caught a supossedly useless observable error. Feel free to report this if this is an issue.'
  );
  debug.error(err);
  return EMPTY;
});

class BaseError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class InternalEditorError extends BaseError {
  constructor(cause: unknown) {
    super('Internal editor error occurred', { cause });
  }
}
