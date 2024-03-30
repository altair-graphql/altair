module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier', 'no-unsanitized'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 85,
        overrides: [
          {
            files: 'tsconfig.json',
            options: {
              trailingComma: 'none',
            },
          },
        ],
      },
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-unresolved': 0,
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-console': 'error',
    'new-cap': 'off',
  },
};
