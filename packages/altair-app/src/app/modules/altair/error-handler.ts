import {
  ErrorHandler,
  Injector,
  ApplicationRef,
  Injectable,
  inject,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from './utils/logger';
import { NotifyService } from './services';
import { UnknownError } from './interfaces/shared';
import { truncateText } from './utils';
import { getIssueUrl } from './utils/issue';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: UnknownError) {
    // const appRef = this.injector.get(ApplicationRef);
    if (error instanceof HttpErrorResponse) {
      debug.error('Backend returned status code: ', error.status);
      debug.error('Response body:', error.message);
    } else {
      const notifyService = this.injector.get(NotifyService);

      const issueUrl = getIssueUrl(error);
      debug.error('Application error:', error);
      notifyService.error(`An error occurred: ${this.getErrorMessage(error)}`);
      notifyService.warning(
        `If this happens multiple times, please click here to report this issue.`,
        'Altair',
        {
          disableTimeOut: true,
          data: {
            url: issueUrl,
          },
        }
      );
    }
    // appRef.tick();
  }
  getErrorMessage(error: UnknownError) {
    if (error instanceof Error) {
      return error.message;
    }

    return JSON.stringify(error);
  }
  isUncaughtPromiseError(error: UnknownError) {
    const errorMessage = this.getErrorMessage(error);
    return errorMessage.startsWith('Uncaught (in promise):');
  }
}
