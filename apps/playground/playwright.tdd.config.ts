import { defineConfig } from "@dev/playwright"
import { authProject, tddProject } from "@dev/playwright/projects"
import playgroundConfig from "./playwright.config"

export default defineConfig({
  ...playgroundConfig,
  webServer: {
    ...playgroundConfig.webServer,
    command: [
      "rm -f .playwright/logs/app.log",
      "mkdir -p .playwright/logs",
      "pnpm start > .playwright/logs/app.log 2>&1",
    ].join(" && "),
    reuseExistingServer: !process.env.CI,
  },
  use: {
    ...playgroundConfig.use,
    trace: "off",
  },
  projects: [authProject, tddProject],
})
