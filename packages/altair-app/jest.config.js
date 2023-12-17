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
  resolver: '<rootDir>/jest.resolver.js',
  collectCoverage: true,
  globalSetup: '<rootDir>/jest/global-setup.ts',
  // moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transformIgnorePatterns: [
    'node_modules/(?!@angular|@firebase|@ngrx|@sentry|lodash-es|altair-graphql-core|angular-resizable-element|dexie|uuid|ngx-cookie-service|ngx-markdown|ky|color-name|json-schema-library|graphql-language-service|vscode-languageserver-types|cm6-graphql|ngx-toastr|@ngx-translate|lucide-angular|@ctrl/ngx-codemirror)',
  ],
};
