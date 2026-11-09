import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["typescript", "unicorn"],
  jsPlugins: ["@dev/oxlint/plugin"],
  categories: {
    correctness: "error",
    suspicious: "error",
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
    // dissabling from categories
    "react/react-in-jsx-scope": "off",
    "no-underscore-dangle": "off",
    "unicorn/no-array-sort": "off",

    // adding rules
    "no-case-declarations": "error",
    "no-empty": "error",
    "no-fallthrough": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "preserve-caught-error": "error",
    "no-array-constructor": "error",
    "no-useless-constructor": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "typescript/no-dynamic-delete": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-extraneous-class": "error",
    "typescript/no-invalid-void-type": "error",
    "typescript/no-namespace": "error",
    "typescript/no-non-null-asserted-nullish-coalescing": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/prefer-literal-enum-member": "error",
    "typescript/unified-signatures": "error",
    "tohuhono/no-type-assertion-except-object-keys": ["error"],
    "typescript/ban-ts-comment": [
      "error",
      {
        minimumDescriptionLength: 10,
      },
    ],
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
