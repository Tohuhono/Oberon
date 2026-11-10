import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc"],
  jsPlugins: ["@dev/oxlint/plugin"],
  categories: {
    correctness: "error",
    suspicious: "error",
    pedantic: "warn",
  },
  env: {
    builtin: true,
    node: true,
  },
  ignorePatterns: [
    ".next/**/*",
    ".vercel/**/*",
    ".output/**/*",
    ".tanstack/**/*",
    ".playwright/**/*",
    "node_modules/**/*",
    "dist/**/*",
    ".rollup.cache/**/*",
    ".playwright/e2e-runtime/**",
    "**/*.gen.ts",
    "**/*.d.ts",
  ],
  rules: {
    // dissabled from categories
    "no-underscore-dangle": "off",
    "react/react-in-jsx-scope": "off",
    "unicorn/no-array-sort": "off",

    // dissabled from pedantic
    "ban-types": "off",
    "explicit-length-check": "off",
    "max-classes-per-file": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "no-promise-executor-return": "off",
    // TODO: warn
    "no-warning-comments": "off",
    "require-await": "off",
    "unicorn/no-useless-switch-case": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-top-level-await": "off",

    // TODO
    "unicorn/prefer-import-meta-properties": "off",
    "unicorn/prefer-single-call": "off",
    "unicorn/prefer-string-replace-all": "off",
    radix: "off",

    // Style
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "typescript/unified-signatures": "error",

    // Restriction
    "no-empty": "error",
    "no-regex-spaces": "error",
    "no-var": "error",
    "typescript/no-dynamic-delete": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-invalid-void-type": "error",
    "typescript/no-namespace": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-require-imports": "error",
    "typescript/prefer-literal-enum-member": "error",

    // Custom
    "tohuhono/no-type-assertion-except-object-keys": "error",
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "no-unused-vars": "off",
      },
    },
    {
      files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*.ts", "**/test/**/*.tsx"],
      rules: {
        "tohuhono/no-type-assertion-except-object-keys": "off",
        "no-empty-pattern": "off",
        "unicorn/consistent-function-scoping": "off",
        "typescript/no-explicit-any": "off",
        "typescript/no-non-null-assertion": "off",
      },
    },
  ],
})
