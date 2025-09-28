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
  transformIgnorePatterns: ['node_modules/.pnpm/(?!uuid|ngx-pipes)'],
};
