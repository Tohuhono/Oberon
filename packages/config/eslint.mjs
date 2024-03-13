// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"
import { FlatCompat } from "@eslint/eslintrc"
import path from "path"
import { fileURLToPath } from "url"

// https://github.com/import-js/eslint-plugin-import/issues/2556
// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})
const importOrder = compat.plugins("import")

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
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettierConfig,
  ...compat.plugins("import"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // ensure consistant imports
      "import/order": "error",
      // conflicts with the the smarter tsc version
      "@typescript-eslint/no-unused-vars": "off",
      // prevent enums
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Don't declare enums",
        },
      ],
    },
  },
)
