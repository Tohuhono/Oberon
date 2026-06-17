import { tanstackConfig } from "@tanstack/eslint-config"
import { defineConfig } from "oxlint"

import reactConfig from "./react.config.ts"

export default defineConfig({
  extends: [reactConfig],
  ...tanstackConfig,
})
