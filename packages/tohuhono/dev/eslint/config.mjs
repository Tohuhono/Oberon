// @ts-check

import path from "path"
import { fileURLToPath } from "url"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"
import { FlatCompat } from "@eslint/eslintrc"
import globals from "globals"

// https://github.com/import-js/eslint-plugin-import/issues/2556
// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default tseslint.config(
  {
    ignores: [
      ".next/**/*",
      ".vercel/**/*",
      "node_modules/**/*",
      "dist/**/*",
      ".rollup.cache/**/*",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...compat.plugins("import"),
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // ensure consistant imports
      "import/order": [
        "error",
        {
          pathGroups: [
            {
              pattern: "dotenv",
              group: "builtin",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["dotenv"],
        },
      ], //"dotenv"
      // conflicts with the the smarter tsc version
      "@typescript-eslint/no-unused-vars": "off",
      // Use this to provide a consistant interface name
      "@typescript-eslint/no-empty-object-type": "off",
      // prevent enums
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Don't declare enums",
        },
      ],
      curly: "error",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      // any is ok in test files
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
)
