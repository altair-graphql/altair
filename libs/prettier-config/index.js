module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  overrides: [
    {
      files: 'tsconfig.json',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
