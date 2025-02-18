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
  startWebTransaction: newrelic.startWebTransaction,
  getTransaction: newrelic.getTransaction,
  recordMetric: newrelic.recordMetric,
  incrementMetric: newrelic.incrementMetric,
};

export const getAgent = (): Agent | undefined => {
  // return;
  if (process.env.NEW_RELIC_APP_NAME) {
    return prodAgent;
  }
  return;
};
