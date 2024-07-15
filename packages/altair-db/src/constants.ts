export const BASIC_PLAN_ID = 'basic';
export const PRO_PLAN_ID = 'pro';

export const PLAN_IDS = {
  BASIC: BASIC_PLAN_ID,
  PRO: PRO_PLAN_ID,
} as const;

export const DEFAULT_MAX_QUERY_COUNT = 20;
export const DEFAULT_MAX_TEAM_COUNT = 1;
export const DEFAULT_MAX_TEAM_MEMBER_COUNT = 2;
export const DEFAULT_QUERY_REVISION_LIMIT = 10;

// TODO: Update quantities
export const INITIAL_CREDIT_BALANCE = 3;
export const MONTHLY_CREDIT_REFILL = 5;
