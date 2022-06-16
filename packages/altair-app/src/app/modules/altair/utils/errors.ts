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
