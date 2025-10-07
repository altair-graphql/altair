import { environment } from 'environments/environment';
import { truncateText } from '..';
import { UnknownError } from '../../interfaces/shared';
import { issueErrorTemplate } from './template';

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

  const url = githubIssueUrl({
    org: 'altair-graphql',
    repo: 'altair',
    title: issueTitle,
    template: 'bug_report.yaml',
    bodyFields: {
      'current-behavior': issueErrorTemplate(errorMessage, getErrorStack(error)),
      'expected-behavior': 'No errors should occur',
      environment: `- OS: \n- Browser: \n- Platform: \n- Version: ${environment.version}`,
    },
  });

  return url;
};

interface IssueUrlOptions {
  org: string;
  repo: string;
  title: string;
  template: string;
  bodyFields: Record<string, string>;
}
const githubIssueUrl = (options: IssueUrlOptions) => {
  const { org, repo, title, template, bodyFields } = options;

  const url = `https://github.com/${org}/${repo}/issues/new`;
  const params = new URLSearchParams({
    title,
    template,
    ...bodyFields,
  });

  const u = new URL(url);
  u.search = params.toString();

  return u.toString();
};
