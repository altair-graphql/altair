import { config } from './newrelic/config';

// Required to be at the root of the service for newrelic to pick it up
exports.config = config;
