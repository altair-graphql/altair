import type {
  startWebTransaction,
  getTransaction,
  recordMetric,
  incrementMetric,
} from 'newrelic';

export interface Agent {
  startWebTransaction: typeof startWebTransaction;
  getTransaction: typeof getTransaction;
  recordMetric: typeof recordMetric;
  incrementMetric: typeof incrementMetric;
}

export const getAgent = (): Agent | undefined => {
  if (process.env.NEW_RELIC_APP_NAME && process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const newrelic = require('newrelic');
    return {
      startWebTransaction: (...args: unknown[]) =>
        newrelic.startWebTransaction(...args),
      getTransaction: (...args: unknown[]) => newrelic.getTransaction(...args),
      recordMetric: (name: string, ...rest: unknown[]) =>
        newrelic.recordMetric(name.split('.').join('/'), ...rest),
      incrementMetric: (name: string, ...rest: unknown[]) =>
        newrelic.incrementMetric(name.split('.').join('/'), ...rest),
    };
  }
  return;
};
