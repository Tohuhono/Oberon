import { defineConfig } from "oxlint"

import baseConfig from "./base.config.ts"

export default defineConfig({
  extends: [baseConfig],
  plugins: ["react", "react-perf"],
})
