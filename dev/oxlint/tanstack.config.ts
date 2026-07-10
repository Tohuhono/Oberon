import { defineConfig } from "oxlint"

import reactConfig from "./react.config.ts"

export default defineConfig({
  extends: [reactConfig],
  settings: reactConfig.settings,
})
