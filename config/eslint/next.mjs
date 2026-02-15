// @ts-check
import { defineConfig } from "eslint/config"
import nextPlugin from "@next/eslint-plugin-next"
import globals from "globals"
import reactConfig from "./react.mjs"

export default defineConfig(
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
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
)
