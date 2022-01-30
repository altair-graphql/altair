import { ErrorHandler, Injector, ApplicationRef, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from './utils/logger';
import { NotifyService } from './services';
import newGithubIssueUrl from 'new-github-issue-url';
import { UnknownError } from './interfaces/shared';
import { truncateText } from './utils';
import { getIssueUrl } from './utils/issue';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {
  }
  handleError(error: UnknownError) {
    // const appRef = this.injector.get(ApplicationRef);
    if (error instanceof HttpErrorResponse) {
      debug.error('Backend returned status code: ', error.status);
      debug.error('Response body:', error.message);
    } else {
      const notifyService = this.injector.get(NotifyService);
      const errorMessage = error.message ? error.message : error.toString();

      const issueUrl = getIssueUrl(error);
      debug.error('Application error:', errorMessage);
      notifyService.error(`An error occured: ${errorMessage}`);
      notifyService.warning(`If you think this is a bug, click here to report the bug.`, 'Altair', {
        disableTimeOut: true,
        data: {
          url: issueUrl,
        }
      });
    }
    // appRef.tick();
  }
}
