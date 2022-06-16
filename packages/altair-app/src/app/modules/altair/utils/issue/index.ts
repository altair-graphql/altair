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

export const getIssueUrl = (error: UnknownError) => {
  const errorMessage = error.message ? error.message : error.toString();
  const issueTitle = `Bug: Application error: ${truncateText(errorMessage)}`;
  const issueBody = issueTemplate
    .replaceAll(ISSUE_TEMPLATE_ERROR_MESSAGE_PLACEHOLDER, errorMessage)
    .replaceAll(ISSUE_TEMPLATE_ERROR_STACK_PLACEHOLDER, error.stack)
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
