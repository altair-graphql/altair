const parentConfig = require('../jest.config');

module.exports = {
  ...parentConfig,
  testRegex: '.e2e-spec.ts$',
  rootDir: '../',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.spec.ts'],
};
