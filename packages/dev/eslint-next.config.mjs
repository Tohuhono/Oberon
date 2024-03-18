// @ts-check

import tseslint from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"
import globals from "globals"
import reactConfig from "./eslint-react.config.mjs"

export default tseslint.config(
  ...reactConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    // @ts-expect-error next is not up with the play
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
)
