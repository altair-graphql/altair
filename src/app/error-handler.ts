import { ErrorHandler, Injector, ApplicationRef, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from './utils/logger';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {
  }
  handleError(error: any) {
    // const appRef = this.injector.get(ApplicationRef);
    if (error instanceof HttpErrorResponse) {
      debug.error('Backend returned status code: ', error.status);
      debug.error('Response body:', error.message);
    } else {
      debug.error('Application error:', error.message);
    }
    // appRef.tick();
  }
}
