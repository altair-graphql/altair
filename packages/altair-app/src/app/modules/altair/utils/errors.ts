import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { debug } from './logger';

export const catchUselessObservableError = catchError((err) => {
  debug.error(
    'Caught a supposedly useless observable error. Feel free to report this if this is an issue.'
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

export const getErrorResponse = async (err: unknown) => {
  if (err && typeof err === 'object') {
    // ky HTTP error: https://github.com/sindresorhus/ky#httperror
    if ('name' in err && err.name === 'HTTPError' && 'response' in err) {
      try {
        return await (err.response as Response).json();
      } catch {
        // Response body is not valid JSON — return the raw text instead
        return { message: await (err.response as Response).text() };
      }
    }
  }

  return err;
};

export const getApiErrorCode = (err: unknown) => {
  if (!err) {
    return;
  }
  if (err && typeof err === 'object' && 'error' in err) {
    if (
      err.error &&
      typeof err.error === 'object' &&
      'code' in err.error &&
      typeof err.error.code === 'string'
    ) {
      return err.error.code;
    }
  }
};
