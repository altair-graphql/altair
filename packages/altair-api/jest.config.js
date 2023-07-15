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
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/mocks/**',
    '!src/**/config.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.input.ts',
    '!src/**/*.module.ts',
    '!src/**/*.strategy.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./custom-matchers.ts'],
};
