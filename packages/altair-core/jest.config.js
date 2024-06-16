/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  coverageDirectory: '<rootDir>/.coverage',
  collectCoverage: true,
  globals: {
    fetch: global.fetch,
    // Headers: global.Headers,
    // Request: global.Request,
    // Response: global.Response,
    // FormData: global.FormData,
  },
};
