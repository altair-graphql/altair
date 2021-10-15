import { ErrorHandler, Injector, ApplicationRef, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from './utils/logger';
import { NotifyService } from './services';
import newGithubIssueUrl from 'new-github-issue-url';

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
      const notifyService = this.injector.get(NotifyService);
      const errorMessage = error.message ? error.message : error.toString();
      const issueTitle = `Bug: Application error: ${errorMessage}`;
      const issueBody = `
        \nError message: ${errorMessage}\n\nError stack:\n\n\`\`\`\n${error.stack}\n\`\`\`
        \n### When did this error occur? And does it re occur, or it happened only once?\n
        \n### Please provide some helpful screenshots of the bug
      `;
      const issueUrl = newGithubIssueUrl({
        user: 'imolorhe',
        repo: 'altair',
        title: issueTitle,
        body: issueBody,
        labels: [ 'bug-report' ],
        template: 'Bug_report.md',
      });
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
