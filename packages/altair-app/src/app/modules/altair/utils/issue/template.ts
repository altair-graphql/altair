export const ISSUE_TEMPLATE_ERROR_STACK_PLACEHOLDER = '{ERROR_STACK}';
export const ISSUE_TEMPLATE_ERROR_MESSAGE_PLACEHOLDER = '{ERROR_MESSAGE}';
export const ISSUE_TEMPLATE_ALTAIR_VERSION_PLACEHOLDER = '{ALTAIR_VERSION}';

export const issueTemplate = `
Error message: ${ISSUE_TEMPLATE_ERROR_MESSAGE_PLACEHOLDER}

Error stack:

\`\`\`
${ISSUE_TEMPLATE_ERROR_STACK_PLACEHOLDER}
\`\`\`

### When did this error occur? And does it re occur, or it happened only once?

### Please provide some helpful screenshots of the bug

Version ${ISSUE_TEMPLATE_ALTAIR_VERSION_PLACEHOLDER}

`;
