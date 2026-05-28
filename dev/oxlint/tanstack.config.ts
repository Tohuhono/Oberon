import { defineConfig } from "oxlint"

import reactConfig from "./react.config"

export default defineConfig({
  ...reactConfig,
  jsPlugins: [
    ...reactConfig.jsPlugins,
    "@tanstack/eslint-plugin-query",
    "@tanstack/eslint-plugin-router",
  ],
})
