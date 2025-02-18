import type {
  startWebTransaction,
  getTransaction,
  recordMetric,
  incrementMetric,
} from 'newrelic';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const newrelic = require('newrelic');

export interface Agent {
  startWebTransaction: typeof startWebTransaction;
  getTransaction: typeof getTransaction;
  recordMetric: typeof recordMetric;
  incrementMetric: typeof incrementMetric;
}

const prodAgent: Agent = {
  startWebTransaction: (...args: unknown[]) => newrelic.startWebTransaction(...args),
  getTransaction: (...args: unknown[]) => newrelic.getTransaction(...args),
  recordMetric: (name: string, ...rest: unknown[]) =>
    newrelic.recordMetric(`Custom/${name.split('.').join('/')}`, ...rest),
  incrementMetric: (name: string, ...rest: unknown[]) =>
    newrelic.incrementMetric(`Custom/${name.split('.').join('/')}`, ...rest),
};

export const getAgent = (): Agent | undefined => {
  if (process.env.NEW_RELIC_APP_NAME) {
    return prodAgent;
  }
  return;
};
