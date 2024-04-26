/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
};
