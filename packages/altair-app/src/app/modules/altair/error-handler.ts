import {
  ErrorHandler,
  Injector,
  ApplicationRef,
  Injectable,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from './utils/logger';
import { NotifyService } from './services';
import newGithubIssueUrl from 'new-github-issue-url';
import { UnknownError } from './interfaces/shared';
import { truncateText } from './utils';
import { getIssueUrl } from './utils/issue';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: UnknownError) {
    // const appRef = this.injector.get(ApplicationRef);
    if (error instanceof HttpErrorResponse) {
      debug.error('Backend returned status code: ', error.status);
      debug.error('Response body:', error.message);
    } else {
      const notifyService = this.injector.get(NotifyService);

      const issueUrl = getIssueUrl(error);
      debug.error('Application error:', error);
      notifyService.error(`An error occured: ${this.getErrorMessage(error)}`);
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
  getErrorMessage(error: any) {
    return error.message
      ? (error.message as string)
      : (error.toString() as string);
  }
  isUncaughtPromiseError(error: any) {
    const errorMessage = this.getErrorMessage(error);
    return errorMessage.startsWith('Uncaught (in promise):');
  }
}
