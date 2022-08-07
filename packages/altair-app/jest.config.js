// const { pathsToModuleNameMapper } = require('ts-jest');
// const { paths } = require('./tsconfig.json').compilerOptions;

// eslint-disable-next-line no-undef
globalThis.ngJest = {
  skipNgcc: false,
  tsconfig: 'tsconfig.spec.json',
};

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'jest-preset-angular',
  collectCoverage: true,
  globalSetup: 'jest-preset-angular/global-setup',
  // moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleDirectories: ['node_modules', '../../node_modules', 'src'],
  transformIgnorePatterns: [
    'node_modules/(?!@angular|@firebase|firebase|@ngrx|lodash-es|altair-graphql-core|dexie|uuid|ngx-cookie-service)',
  ],
};
