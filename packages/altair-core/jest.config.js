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
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!@angular|@firebase|@ngrx|@sentry|lodash-es|altair-graphql-core|angular-resizable-element|angular-split|dexie|uuid|ngx-cookie-service|ngx-markdown|ky|color-name|json-schema-library|graphql-language-service|vscode-languageserver-types|cm6-graphql|ngx-toastr|@ngx-translate|lucide-angular|ng-zorro-antd|@ant-design\\+icons-angular|ngx-pipes)',
  ],
};
