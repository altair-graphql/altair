module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!@angular|@firebase|@ngrx|@sentry|lodash-es|altair-graphql-core|angular-resizable-element|angular-split|dexie|uuid|ngx-cookie-service|ngx-markdown|ky|color-name|json-schema-library|graphql-language-service|vscode-languageserver-types|cm6-graphql|ngx-toastr|@ngx-translate|lucide-angular|ng-zorro-antd|@ant-design\\+icons-angular|ngx-pipes)',
  ],
  // transformIgnorePatterns: ['node_modules/(?!(zod|altair-graphql-core)/)'],
};
