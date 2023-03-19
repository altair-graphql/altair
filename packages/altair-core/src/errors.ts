export const ERRORS = {
  ERR_MAX_TEAM_COUNT:
    'You have reached the limit of the number of teams for your plan',
  ERR_MAX_QUERY_COUNT:
    'You have reached the limit of the number of queries for your plan',
  ERR_MAX_TEAM_MEMBER_COUNT:
    'You have reached the limit of the number of team members in a team for your plan',
  ERR_PERM_DENIED: 'You do not have permission to access this resource',
};

export type ErrorCode = keyof typeof ERRORS;
