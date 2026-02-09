// @ts-check
import { defineConfig } from "eslint/config"
import hooksPlugin from "eslint-plugin-react-hooks"
import reactRecommended from "eslint-plugin-react"
import globals from "globals"
import baseConfig from "./config.mjs"

export default defineConfig(
  ...baseConfig,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    rules: {
      ...reactRecommended.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/no-unescaped-entities": "off",
    },
    plugins: {
      react: reactRecommended,
    },
    languageOptions: {
      parserOptions: reactRecommended.configs.recommended.parserOptions || {},
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["packages/tohuhono/ui/**/*.{ts,tsx}"],
    rules: {
      "react/no-unknown-property": "off",
    },
  },
  hooksPlugin.configs.flat.recommended,
)
