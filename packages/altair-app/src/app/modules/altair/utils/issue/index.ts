import { environment } from 'environments/environment';
import newGithubIssueUrl from 'new-github-issue-url';
import { truncateText } from '..';
import { UnknownError } from '../../interfaces/shared';
import {
  issueTemplate,
  ISSUE_TEMPLATE_ALTAIR_VERSION_PLACEHOLDER,
  ISSUE_TEMPLATE_ERROR_MESSAGE_PLACEHOLDER,
  ISSUE_TEMPLATE_ERROR_STACK_PLACEHOLDER,
} from './template';

const getErrorMessage = (error: UnknownError) => {
  if (!error) {
    return '';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }

  return `${error}`;
};
const getErrorStack = (error: UnknownError) => {
  if (!error) {
    return '';
  }

  if (error instanceof Error) {
    return error.stack || '';
  }

  return '';
};

export const getIssueUrl = (error: UnknownError) => {
  const errorMessage = getErrorMessage(error);
  const issueTitle = `Bug: Application error: ${truncateText(errorMessage)}`;
  const issueBody = issueTemplate
    .replaceAll(ISSUE_TEMPLATE_ERROR_MESSAGE_PLACEHOLDER, errorMessage)
    .replaceAll(ISSUE_TEMPLATE_ERROR_STACK_PLACEHOLDER, getErrorStack(error))
    .replaceAll(ISSUE_TEMPLATE_ALTAIR_VERSION_PLACEHOLDER, environment.version);

  const issueUrl = newGithubIssueUrl({
    user: 'imolorhe',
    repo: 'altair',
    title: issueTitle,
    body: issueBody,
    labels: ['bug-report'],
    template: 'Bug_report.md',
  });

  return issueUrl;
};
