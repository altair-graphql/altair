module.exports = {
  root: true,
  ignorePatterns: ['projects/**/*'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: ['tsconfig.json', 'e2e/tsconfig.json'],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
      extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/all',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@ngrx/all',
        'prettier',
        'altair',
      ],
      plugins: [
        'prettier',
        // '@ngrx'
      ],
      rules: {
        '@angular-eslint/component-selector': [
          'error',
          {
            prefix: 'app',
            style: 'kebab-case',
            type: 'element',
          },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            prefix: 'app',
            style: 'camelCase',
            type: 'attribute',
          },
        ],
        '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
        // '@angular-eslint/prefer-standalone-component': 'warn',
        '@angular-eslint/prefer-standalone': 'warn',
        '@angular-eslint/consistent-component-styles': 'off',
        '@angular-eslint/sort-keys-in-type-decorator': 'off',
        '@angular-eslint/use-injectable-provided-in': 'warn',
        '@angular-eslint/prefer-output-readonly': 'warn',
        '@angular-eslint/prefer-output-emitter-ref': 'warn',
        '@angular-eslint/sort-lifecycle-methods': 'warn',
        '@angular-eslint/use-component-selector': 'warn',
        '@angular-eslint/prefer-signals': 'warn',
        'prettier/prettier': 0,
        'require-await': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/no-this-alias': 'off',
        // '@ngrx/no-typed-global-store': 'off',
        // '@ngrx/prefer-action-creator-in-dispatch': 'warn',
      },
    },
    {
      files: ['*.html'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/all',
      ],
      rules: {
        '@angular-eslint/template/conditional-complexity': 'off',
        '@angular-eslint/template/i18n': 'off', // Disable for now as we don't have i18n setup
        '@angular-eslint/template/attributes-order': 'off',
        '@angular-eslint/template/no-call-expression': 'off',
        '@angular-eslint/template/cyclomatic-complexity': 'warn',
        '@angular-eslint/template/no-nested-tags': 'warn',
        '@angular-eslint/template/no-inline-styles': 'off',
        '@angular-eslint/template/label-has-associated-control': 'off',
        '@angular-eslint/template/button-has-type': 'warn',

        // TODO: Revisit these later
        '@angular-eslint/template/interactive-supports-focus': 'warn',
        '@angular-eslint/template/click-events-have-key-events': 'warn',
        '@angular-eslint/template/prefer-ngsrc': 'warn',
      },
    },
    {
      files: ['*.js'],
      parserOptions: {
        ecmaVersion: 'latest',
      },

      env: {
        es6: true,
      },
    },
  ],
};
