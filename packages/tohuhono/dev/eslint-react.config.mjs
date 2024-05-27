// @ts-check

import tseslint from "typescript-eslint"
import hooksPlugin from "eslint-plugin-react-hooks"
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import baseConfig from "./eslint.config.mjs"

export default tseslint.config(
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
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    // @ts-expect-error not typed correctly
    rules: hooksPlugin.configs.recommended.rules,
  },
)
