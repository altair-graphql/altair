module.exports = {
  root: true,
  ignorePatterns: [
    "projects/**/*"
  ],
  overrides: [
    {
      files: [
        "*.ts"
      ],
      parserOptions: {
        project: [
          "tsconfig.json",
          "e2e/tsconfig.json"
        ],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true
      },
      extends: [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:@typescript-eslint/recommended",
        "prettier",
      ],
      plugins: [
        "prettier",
      ],
      rules: {
        '@angular-eslint/component-selector': [
          "error",
          {
            prefix: "app",
            style: "kebab-case",
            type: "element"
          }
        ],
        '@angular-eslint/directive-selector': [
          "error",
          {
            prefix: "app",
            style: "camelCase",
            type: "attribute"
          }
        ],
        "prettier/prettier": 1,
        "require-await": "off",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/no-this-alias": "off",
      }
    },
    {
      files: [
        "*.html"
      ],
      extends: [
        "plugin:@angular-eslint/template/recommended"
      ],
      rules: {}
    }
  ]
}
