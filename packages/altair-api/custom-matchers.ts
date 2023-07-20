function typeCheck(name: string, value: unknown, expectedType: string) {
  const type = typeof value;
  if (type != expectedType) {
    return {
      pass: false,
      message: () =>
        `expected ${name} (value: ${value}) to be ${expectedType}, but found ${type} instead.`,
    };
  }

  return { pass: true, message: () => '' };
}

function toBeUser(user: any) {
  let check = typeCheck('User.id', user?.id, 'string');
  if (!check.pass) return check;

  check = typeCheck('User.email', user?.email, 'string');
  if (!check.pass) return check;

  check = typeCheck('User.firstName', user?.firstName, 'string');
  if (!check.pass) return check;

  check = typeCheck('User.lastName', user?.lastName, 'string');
  if (!check.pass) return check;

  check = typeCheck('User.picture', user?.picture, 'string');
  if (!check.pass) return check;

  return {
    pass: true,
    message: () => `expected ${user} not to match the shape of a User object`,
  };
}

function toBePlanConfig(planConfig: any) {
  let check = typeCheck('PlanConfig.id', planConfig?.id, 'string');
  if (!check.pass) return check;

  check = typeCheck(
    'PlanConfig.stripeProductId',
    planConfig?.stripeProductId,
    'string'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'PlanConfig.maxQueryCount',
    planConfig?.maxQueryCount,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'PlanConfig.maxTeamCount',
    planConfig?.maxTeamCount,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'PlanConfig.maxTeamMemberCount',
    planConfig?.maxTeamMemberCount,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'PlanConfig.allowMoreTeamMembers',
    planConfig?.allowMoreTeamMembers,
    'boolean'
  );
  if (!check.pass) return check;

  return {
    pass: true,
    message: () =>
      `expected ${planConfig} not to match the shape of a PlanConfig object`,
  };
}

function toBeSubscriptionItem(subItem: any) {
  let check = typeCheck('SubscriptionItem.id', subItem?.id, 'string');
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.object', subItem?.object, 'object');
  if (!check.pass) return check;

  check = typeCheck(
    'SubscriptionItem.billing_thresholds',
    subItem?.billing_thresholds,
    'object'
  );
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.created', subItem?.created, 'number');
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.metadata', subItem?.metadata, 'object');
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.plan', subItem?.plan, 'object');
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.price', subItem?.price, 'object');
  if (!check.pass) return check;

  check = typeCheck(
    'SubscriptionItem.subscription',
    subItem?.subscription,
    'string'
  );
  if (!check.pass) return check;

  check = typeCheck('SubscriptionItem.tax_rates', subItem?.tax_rates, 'object');
  if (!check.pass) return check;

  check = typeCheck(
    'SubscriptionItem.lastResponse',
    subItem?.lastResponse,
    'object'
  );
  if (!check.pass) return check;

  return {
    pass: true,
    message: () =>
      `expected ${subItem} not to match the shape of a SubscriptionItem object`,
  };
}

function toBePlan(plan: any) {
  let check = typeCheck('Plan.id', plan?.id, 'string');
  if (!check.pass) return check;

  check = typeCheck('Plan.maxQueriesCount', plan?.maxQueriesCount, 'number');
  if (!check.pass) return check;

  check = typeCheck('Plan.maxTeamsCount', plan?.maxTeamsCount, 'number');
  if (!check.pass) return check;

  check = typeCheck('Plan.maxTeamsCount', plan?.maxTeamsCount, 'number');
  if (!check.pass) return check;

  check = typeCheck(
    'Plan.maxTeamMembersCount',
    plan?.maxTeamMembersCount,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck('Plan.canUpgradePro', plan?.canUpgradePro, 'boolean');
  if (!check.pass) return check;

  return {
    pass: true,
    message: () => `expected ${plan} not to match the shape of a Plan object`,
  };
}

function toBeUserStats(stats: any) {
  let check = typeCheck('UserStats.queries.own', stats?.queries?.own, 'number');
  if (!check.pass) return check;

  check = typeCheck(
    'UserStats.queries.access',
    stats?.queries?.access,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'UserStats.collections.own',
    stats?.collections?.own,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck(
    'UserStats.collections.access',
    stats?.collections?.access,
    'number'
  );
  if (!check.pass) return check;

  check = typeCheck('UserStats.teams.own', stats?.teams?.own, 'number');
  if (!check.pass) return check;

  check = typeCheck('UserStats.teams.access', stats?.teams?.access, 'number');
  if (!check.pass) return check;

  return {
    pass: true,
    message: () => `expected ${stats} not to match the shape of a Plan object`,
  };
}

expect.extend({
  toBeUser,
  toBePlanConfig,
  toBeSubscriptionItem,
  toBePlan,
  toBeUserStats,
});
