import { resolve } from "path"

import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss"
import { defineConfig } from "oxlint"

import baseConfig from "./base.config.ts"

const entryPoint = resolve(import.meta.dirname, "../../packages/oberoncms/core/tailwind.css")

export default defineConfig({
  extends: [baseConfig],
  plugins: ["react", "react-perf"],
  jsPlugins: ["eslint-plugin-better-tailwindcss"],
  rules: {
    ...eslintPluginBetterTailwindcss.configs.recommended.rules,
    "better-tailwindcss/enforce-consistent-line-wrapping": ["error", { strictness: "loose" }],
  },
  settings: {
    "better-tailwindcss": {
      entryPoint,
    },
  },
})
