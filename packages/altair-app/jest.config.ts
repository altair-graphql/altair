import presets from 'jest-preset-angular/presets';
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from './tsconfig.json';

// eslint-disable-next-line no-undef
// (globalThis as any).ngJest = {
//   skipNgcc: false,
//   tsconfig: 'tsconfig.spec.json',
// };
const presetConfig = presets.createCjsPreset();

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const jestConfig: Config = {
  ...presetConfig,
  transform: presetConfig.transform as any, // TODO: Somehow the type from jest-preset-angular is not matching, need to investigate
  resolver: '<rootDir>/jest.resolver.js',
  collectCoverage: true,
  modulePaths: ['src'],
  // moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
  // moduleNameMapper: {
  //   'environments/environment': '<rootDir>/src/environments/environment.ts',
  // },
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  // moduleDirectories: ['node_modules', '<rootDir>/src'],
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!@angular|@firebase|@ngrx|@sentry|lodash-es|altair-graphql-core|angular-resizable-element|angular-split|dexie|uuid|ngx-cookie-service|ngx-markdown|ky|color-name|json-schema-library|graphql-language-service|vscode-languageserver-types|cm6-graphql|ngx-toastr|@ngx-translate|lucide-angular|ng-zorro-antd|@ant-design\\+icons-angular|ngx-pipes)',
  ],
};

export default jestConfig;
