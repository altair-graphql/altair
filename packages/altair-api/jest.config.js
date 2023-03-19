const base = require('../../jest.config.base')(__dirname);

module.exports = {
  ...base,
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // transformIgnorePatterns: ['node_modules/(?!@altairgraphql)'],
};
