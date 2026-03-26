import { defineConfig } from "@dev/playwright"
import { tddProject } from "@dev/playwright/projects"
import playgroundConfig from "./playwright.config"

const command = [
  "rm -f .playwright/logs/app.log",
  "mkdir -p .playwright/logs",
  "pnpm start > .playwright/logs/app.log 2>&1",
].join(" && ")

export default defineConfig({
  ...playgroundConfig,
  webServer: {
    ...playgroundConfig.webServer,
    command,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    ...playgroundConfig.use,
    trace: "off",
  },
  projects: [...(playgroundConfig.projects ?? []), tddProject],
})
