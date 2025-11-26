// @ts-check
import { defineConfig } from "eslint/config";
import hooksPlugin from "eslint-plugin-react-hooks"
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import baseConfig from "./config.mjs"

export default defineConfig(
  ...baseConfig,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
  hooksPlugin.configs.flat.recommended,
)
